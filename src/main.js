import './styles/main.css';
import { GateKeeper, STATES } from './utils/gatekeeper.js';
import { initCamera, stopCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch, calibrateAmbientNoise } from './utils/audio.js';
import { getProfile, saveProfile, getDefaultProfile } from './utils/db.js';
import { lar_threshold, f_max } from './utils/constants.js';

const $ = function (id) { return document.getElementById(id); };

const cameraFeed = $('camera-feed');
const overlayCanvas = $('overlay-canvas');
const larDisplay = $('lar-display');
const pitchDisplay = $('pitch-display');
const accuracyDisplay = $('accuracy-display');
const starDisplay = $('star-display');
const errorScreen = $('error-screen');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

let audioInitialized = false;
let audioInitializing = false;
let outOfThresholdSince = 0;
const LAR_DEBOUNCE_MS = 300;

const gatekeeper = new GateKeeper();
let cameraCtrl = null;
let pitchPollId = null;
let flashTimeout = null;
let currentFlash = null;
let crosshairAnimId = null;
let canvasCtx = null;

function updateLar(value) { larDisplay.textContent = value.toFixed(2); }
function updatePitch(value) { pitchDisplay.textContent = value > 0 ? `${Math.round(value)} Hz` : '--'; }
function updateAccuracy(value) { accuracyDisplay.textContent = `${Math.round(value * 100)}%`; }
function updateStars(count) {
  const filled = '\u2605'.repeat(count);
  const empty = '\u2606'.repeat(3 - count);
  starDisplay.textContent = filled + empty;
}
function showError(show, title, msg) {
  if (!show) { errorScreen.classList.add('hidden'); return; }
  errorScreen.classList.remove('hidden');
  if (title) { errorScreen.querySelector('h2').textContent = title; }
  if (msg) { errorScreen.querySelector('p').textContent = msg; }
}

function setFlash(type) {
  if (flashTimeout) { clearTimeout(flashTimeout); flashTimeout = null; }
  if (currentFlash) { overlayCanvas.classList.remove(currentFlash); }
  if (!type) { currentFlash = null; return; }
  overlayCanvas.classList.add(type);
  currentFlash = type;
  flashTimeout = setTimeout(function () {
    overlayCanvas.classList.remove(type);
    currentFlash = null;
    flashTimeout = null;
  }, 400);
}

function drawCrosshair(lar) {
  if (!canvasCtx) { return; }
  const w = overlayCanvas.width;
  const h = overlayCanvas.height;
  canvasCtx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const ratio = Math.min(1, Math.max(0, (lar - 0.1) / 0.6));
  const barLength = 20 + ratio * 30;
  const gap = 6;

  canvasCtx.strokeStyle = 'rgba(13, 71, 161, 0.6)';
  canvasCtx.lineWidth = 3;
  canvasCtx.beginPath();
  canvasCtx.moveTo(cx - barLength - gap, cy);
  canvasCtx.lineTo(cx - gap, cy);
  canvasCtx.moveTo(cx + gap, cy);
  canvasCtx.lineTo(cx + barLength + gap, cy);
  canvasCtx.moveTo(cx, cy - barLength - gap);
  canvasCtx.lineTo(cx, cy - gap);
  canvasCtx.moveTo(cx, cy + gap);
  canvasCtx.lineTo(cx, cy + barLength + gap);
  canvasCtx.stroke();

  canvasCtx.strokeStyle = 'rgba(13, 71, 161, 0.3)';
  canvasCtx.lineWidth = 1;
  canvasCtx.setLineDash([4, 4]);
  canvasCtx.beginPath();
  canvasCtx.arc(cx, cy, 8, 0, Math.PI * 2);
  canvasCtx.stroke();
  canvasCtx.setLineDash([]);
}

function startCrosshair() {
  stopCrosshair();
  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;
  canvasCtx = overlayCanvas.getContext('2d');
  function loop() {
    if (gatekeeper.getState() === STATES.IDLE) { return; }
    drawCrosshair(gatekeeper.getState() === STATES.MIC_OPEN || gatekeeper.getState() === STATES.SESSION_ACTIVE ? 0.5 : 0.2);
    crosshairAnimId = requestAnimationFrame(loop);
  }
  crosshairAnimId = requestAnimationFrame(loop);
}

function stopCrosshair() {
  if (crosshairAnimId) { cancelAnimationFrame(crosshairAnimId); crosshairAnimId = null; }
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    canvasCtx = null;
  }
}

function startPitchPolling() {
  stopPitchPolling();
  pitchPollId = setInterval(function () {
    if (gatekeeper.getState() !== STATES.MIC_OPEN && gatekeeper.getState() !== STATES.SESSION_ACTIVE) { return; }
    const pitch = extractPitch();
    updatePitch(pitch);
    if (pitch > 0) {
      if (pitch > f_max) {
        setFlash('flash-warning');
      } else {
        setFlash('flash-success');
      }
    }
  }, 100);
}

function stopPitchPolling() {
  if (pitchPollId) { clearInterval(pitchPollId); pitchPollId = null; }
}

async function openAudioGate() {
  if (audioInitialized || audioInitializing) { return; }
  audioInitializing = true;
  try {
    await initAudioStream();
    await calibrateAmbientNoise();
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable:', err.message);
    showError(true, 'Mic Error', 'Microphone access denied or unavailable.');
  } finally {
    audioInitializing = false;
  }
}

function closeAudioGate() {
  audioInitialized = false;
  audioInitializing = false;
  closeAudioStream();
}

gatekeeper.onEnter(STATES.CAMERA_ACTIVE, function () {
  showError(false);
  setFlash(null);
  updateAccuracy(0);
  updateStars(0);
  startCrosshair();
});

gatekeeper.onEnter(STATES.LAR_CHECK, function () {
  outOfThresholdSince = 0;
});

gatekeeper.onEnter(STATES.MIC_OPEN, function () {
  openAudioGate();
  startPitchPolling();
});

gatekeeper.onExit(STATES.MIC_OPEN, function () {
  outOfThresholdSince = 0;
  closeAudioGate();
  stopPitchPolling();
  setFlash(null);
});

gatekeeper.onEnter(STATES.SESSION_ACTIVE, function () {
  // reserved for future use
});

gatekeeper.onExit(STATES.SESSION_ACTIVE, function () {
  // reserved for future use
});

gatekeeper.onEnter(STATES.IDLE, function () {
  outOfThresholdSince = 0;
  closeAudioGate();
  stopPitchPolling();
  setFlash(null);
  stopCrosshair();
});

function triggerFallback() {
  outOfThresholdSince = 0;
  gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE, { mode: null });
  setFlash('flash-idle');
}

function onFaceLandmarks(landmarks) {
  if (gatekeeper.getState() === STATES.IDLE) { return; }
  const lar = computeLipAspectRatio(landmarks);
  updateLar(lar);
  const state = gatekeeper.getState();

  if (state === STATES.CAMERA_ACTIVE) {
    if (lar >= lar_threshold.high) {
      gatekeeper.transitionTo(STATES.LAR_CHECK, { mode: 'A' });
    } else if (lar <= lar_threshold.low) {
      gatekeeper.transitionTo(STATES.LAR_CHECK, { mode: 'I' });
    }
  } else if (state === STATES.LAR_CHECK) {
    const mode = gatekeeper.getMode();
    if ((mode === 'A' && lar >= lar_threshold.high) || (mode === 'I' && lar <= lar_threshold.low)) {
      gatekeeper.transitionTo(STATES.MIC_OPEN, { mode });
    } else {
      gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE, { mode: null });
      setFlash('flash-idle');
    }
  } else if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) {
    const mode = gatekeeper.getMode();
    const isValid = (mode === 'A' && lar >= lar_threshold.high) || (mode === 'I' && lar <= lar_threshold.low);
    if (!isValid) {
      if (outOfThresholdSince === 0) { outOfThresholdSince = performance.now(); }
      if (performance.now() - outOfThresholdSince > LAR_DEBOUNCE_MS) {
        triggerFallback();
      }
    } else {
      outOfThresholdSince = 0;
    }
  }
}

function onNoFace() {
  if (gatekeeper.getState() === STATES.IDLE) { return; }
  const state = gatekeeper.getState();
  if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) {
    closeAudioGate();
    stopPitchPolling();
  }
  gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE, { mode: null });
  setFlash('flash-idle');
  showError(true, 'Face Lost', 'Please position your face in the camera.');
}

async function startSession() {
  if (gatekeeper.getState() !== STATES.IDLE) { return; }
  stopCamera();
  audioInitialized = false;
  audioInitializing = false;
  outOfThresholdSince = 0;
  showError(false);
  updateLar(0);
  updatePitch(0);
  updateAccuracy(0);
  updateStars(0);
  setFlash(null);
  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;

  const profile = await getProfile('default_user');
  if (!profile) {
    const def = await getDefaultProfile();
    await saveProfile(def);
  }

  try {
    cameraCtrl = initCamera({
      videoElement: cameraFeed,
      onFace: onFaceLandmarks,
      onNoFace: onNoFace,
    });
    await cameraCtrl.start();
    gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);
  } catch (err) {
    showError(true, 'Camera Error', 'Could not access camera. Please check permissions.');
  }
}

function stopSession() {
  if (gatekeeper.getState() === STATES.IDLE) { return; }
  gatekeeper.reset();
  closeAudioGate();
  stopPitchPolling();
  stopCamera();
  cameraCtrl = null;
  updateLar(0);
  updatePitch(0);
  updateAccuracy(0);
  setFlash(null);
  stopCrosshair();
  showError(false);
}

btnStart.addEventListener('click', startSession);
btnStop.addEventListener('click', stopSession);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
