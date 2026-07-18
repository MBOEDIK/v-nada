import './styles/main.css';
import { GateKeeper, STATES } from './utils/gatekeeper.js';
import { initCamera, stopCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch, calibrateAmbientNoise } from './utils/audio.js';
import { getProfile, saveProfile, getDefaultProfile } from './utils/db.js';
import { lar_threshold, f_max } from './utils/constants.js';

const $ = function (id) { return document.getElementById(id); };

const cameraFeed = $('camera-feed');
const overlayCanvas = $('overlay-canvas');
const checkmarkCanvas = $('checkmark-canvas');
const larDisplay = $('lar-display');
const pitchDisplay = $('pitch-display');
const accuracyDisplay = $('accuracy-display');
const starDisplay = $('star-display');
const errorScreen = $('error-screen');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');
const btnBack = $('btn-back');
const moduleSelect = $('module-select');
const cameraView = $('camera-view');
const appHeader = $('app-header');
const noFaceMsg = $('no-face-msg');
const btnVocatone = $('btn-vocatone');
const btnDualsense = $('btn-dualsense');

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
let checkmarkCtx = null;
let showArrow = false;

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

function drawSilhouette(state) {
  if (!canvasCtx) { return; }
  const w = overlayCanvas.width;
  const h = overlayCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.2;
  const ry = h * 0.12;

  let color;
  let lineWidth;
  switch (state) {
    case 'searching':
      color = '#F8FAFC';
      lineWidth = 2;
      break;
    case 'locked':
      color = '#22C55E';
      lineWidth = 3;
      break;
    case 'out_of_bounds':
      color = '#EF4444';
      lineWidth = 2;
      break;
    default:
      color = '#F8FAFC';
      lineWidth = 2;
  }

  canvasCtx.save();
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = lineWidth;
  canvasCtx.setLineDash([6, 4]);
  canvasCtx.globalAlpha = 0.3;
  canvasCtx.beginPath();
  canvasCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  canvasCtx.stroke();
  canvasCtx.restore();
}

let checkmarkPlaying = false;

function drawCheckmark() {
  if (!checkmarkCtx || checkmarkPlaying) { return; }
  checkmarkPlaying = true;
  checkmarkCanvas.classList.remove('hidden');
  const w = checkmarkCanvas.width;
  const h = checkmarkCanvas.height;
  const cx = w / 2;
  const cy = h / 2;

  checkmarkCtx.clearRect(0, 0, w, h);
  checkmarkCtx.strokeStyle = '#22C55E';
  checkmarkCtx.lineWidth = 8;
  checkmarkCtx.lineCap = 'round';
  checkmarkCtx.lineJoin = 'round';

  let progress = 0;
  function frame() {
    progress += 0.03;
    if (progress >= 1) { progress = 1; }
    checkmarkCtx.clearRect(0, 0, w, h);
    checkmarkCtx.beginPath();
    checkmarkCtx.moveTo(cx - 30, cy);
    const midX = cx - 10;
    const midY = cy + 20;
    const endX = cx + 40;
    const endY = cy - 20;
    if (progress < 0.5) {
      const t = progress / 0.5;
      checkmarkCtx.lineTo(cx - 30 + (midX - (cx - 30)) * t, cy + (midY - cy) * t);
    } else {
      const t = (progress - 0.5) / 0.5;
      checkmarkCtx.lineTo(midX, midY);
      checkmarkCtx.lineTo(midX + (endX - midX) * t, midY + (endY - midY) * t);
    }
    checkmarkCtx.stroke();
    if (progress < 1) { requestAnimationFrame(frame); }
    else { checkmarkPlaying = false; }
  }
  requestAnimationFrame(frame);
}

function clearCheckmark() {
  checkmarkPlaying = false;
  checkmarkCanvas.classList.add('hidden');
  if (checkmarkCtx) {
    checkmarkCtx.clearRect(0, 0, checkmarkCanvas.width, checkmarkCanvas.height);
  }
}

function startCrosshair() {
  stopCrosshair();
  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;
  canvasCtx = overlayCanvas.getContext('2d');
  let orbitAngle = 0;
  let arrowAmp = 0;
  let arrowDir = 1;

  function loop() {
    if (gatekeeper.getState() === STATES.IDLE) { return; }
    canvasCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    const state = gatekeeper.getState();
    let silState = 'searching';
    if (state === STATES.LAR_CHECK) { silState = 'searching'; }
    else if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) { silState = 'locked'; }
    drawSilhouette(silState);

    drawCrosshair(state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE ? 0.5 : 0.2);

    if (state !== STATES.IDLE) {
      orbitAngle += 0.02;
      const w = overlayCanvas.width;
      const h = overlayCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.3;
      canvasCtx.save();
      canvasCtx.strokeStyle = 'rgba(13, 71, 161, 0.3)';
      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();
      canvasCtx.arc(cx + Math.cos(orbitAngle) * radius, cy + Math.sin(orbitAngle) * radius, 6, 0, Math.PI * 2);
      canvasCtx.stroke();
      canvasCtx.restore();
    }

    if (showArrow) {
      arrowAmp += arrowDir * 0.02;
      if (arrowAmp > 1 || arrowAmp < 0) { arrowDir *= -1; arrowAmp = Math.max(0, Math.min(1, arrowAmp)); }
      const w = overlayCanvas.width;
      const cx = w / 2;
      const h = overlayCanvas.height;
      canvasCtx.save();
      const aColor = `rgba(239, 68, 68, ${0.3 + arrowAmp * 0.4})`;
      canvasCtx.fillStyle = aColor;
      canvasCtx.strokeStyle = aColor;
      canvasCtx.lineWidth = 3;
      const arrowY = h * 0.15 + arrowAmp * 10;
      canvasCtx.beginPath();
      canvasCtx.moveTo(cx, arrowY + 20);
      canvasCtx.lineTo(cx - 15, arrowY);
      canvasCtx.lineTo(cx + 15, arrowY);
      canvasCtx.closePath();
      canvasCtx.fill();
      canvasCtx.restore();
    }

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
        drawCheckmark();
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
  noFaceMsg.classList.remove('hidden');
  showArrow = false;
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
  clearCheckmark();
});

gatekeeper.onEnter(STATES.SESSION_ACTIVE, function () {
});

gatekeeper.onExit(STATES.SESSION_ACTIVE, function () {
});

gatekeeper.onEnter(STATES.IDLE, function () {
  outOfThresholdSince = 0;
  closeAudioGate();
  stopPitchPolling();
  setFlash(null);
  stopCrosshair();
  clearCheckmark();
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
    noFaceMsg.classList.add('hidden');
    showArrow = false;
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
  noFaceMsg.classList.remove('hidden');
  showArrow = true;
}

function showHaptic(success) {
  if (navigator.vibrate) {
    if (success) {
      navigator.vibrate(100);
    } else {
      navigator.vibrate([50, 50, 50]);
    }
  }
}

function enterModuleView() {
  moduleSelect.classList.add('hidden');
  appHeader.classList.add('hidden');
  cameraView.classList.remove('hidden');
  btnBack.classList.remove('hidden');
}

function leaveModuleView() {
  moduleSelect.classList.remove('hidden');
  appHeader.classList.remove('hidden');
  cameraView.classList.add('hidden');
  btnBack.classList.add('hidden');
  stopSession();
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
  noFaceMsg.classList.add('hidden');
  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;
  checkmarkCanvas.width = cameraFeed.clientWidth;
  checkmarkCanvas.height = cameraFeed.clientHeight;
  checkmarkCtx = checkmarkCanvas.getContext('2d');

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
    showHaptic(true);
  } catch (err) {
    showError(true, 'Camera Error', 'Could not access camera. Please check permissions.');
    showHaptic(false);
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
  showArrow = false;
  clearCheckmark();
  showError(false);
  noFaceMsg.classList.add('hidden');
  checkmarkCanvas.classList.add('hidden');
}

btnVocatone.addEventListener('click', function () {
  enterModuleView();
  startSession();
});

btnDualsense.addEventListener('click', function () {
  enterModuleView();
  startSession();
});

btnBack.addEventListener('click', function () {
  leaveModuleView();
});

btnStart.addEventListener('click', startSession);
btnStop.addEventListener('click', stopSession);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
