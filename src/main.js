import './styles/main.css';
import { GateKeeper, STATES } from './utils/gatekeeper.js';
import { initCamera, stopCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { f_max } from './utils/constants.js';

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
    if (lar >= 0.5) {
      gatekeeper.transitionTo(STATES.LAR_CHECK, { mode: 'A' });
    } else if (lar <= 0.2) {
      gatekeeper.transitionTo(STATES.LAR_CHECK, { mode: 'I' });
    }
  } else if (state === STATES.LAR_CHECK) {
    const mode = gatekeeper.getMode();
    if ((mode === 'A' && lar >= 0.5) || (mode === 'I' && lar <= 0.2)) {
      gatekeeper.transitionTo(STATES.MIC_OPEN, { mode });
    } else {
      gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE, { mode: null });
      setFlash('flash-idle');
    }
  } else if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) {
    const mode = gatekeeper.getMode();
    const isValid = (mode === 'A' && lar >= 0.5) || (mode === 'I' && lar <= 0.2);
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
  showError(false);
}

btnStart.addEventListener('click', startSession);
btnStop.addEventListener('click', stopSession);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
