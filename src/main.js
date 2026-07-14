import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { lar_threshold } from './utils/constants.js';
import { gatekeeper, STATES } from './utils/gatekeeper.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';

const $ = (id) => document.getElementById(id);

const cameraFeed = $('camera-feed');
const overlayCanvas = $('overlay-canvas');
const larDisplay = $('lar-display');
const pitchDisplay = $('pitch-display');
const accuracyDisplay = $('accuracy-display');
const starDisplay = $('star-display');
const errorScreen = $('error-screen');
const errorTitle = $('error-title');
const errorMessage = $('error-message');
const vowelIndicator = $('vowel-indicator');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

let cameraController = null;
let sessionActive = false;
let lastFaceTime = 0;
let lastLar = 0;
let monitorTimer = null;
let audioInitialized = false;
let pitchInterval = null;

const NO_FACE_TIMEOUT = 1500;

function updateLar(value) {
  larDisplay.textContent = value.toFixed(2);
}

function updatePitch(value) {
  pitchDisplay.textContent = value > 0 ? `${Math.round(value)} Hz` : '--';
}

function updateAccuracy(value) {
  accuracyDisplay.textContent = `${Math.round(value * 100)}%`;
}

function updateStars(count) {
  const filled = '\u2605'.repeat(count);
  const empty = '\u2606'.repeat(3 - count);
  starDisplay.textContent = filled + empty;
}

function showError(show, title, message) {
  errorScreen.classList.toggle('hidden', !show);
  if (show) {
    if (title) errorTitle.textContent = title;
    if (message) errorMessage.textContent = message;
  }
}

function showCameraError(err) {
  const isPermission = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
  showError(
    true,
    isPermission ? 'Camera Access Denied' : 'Camera Error',
    isPermission
      ? 'Please allow camera permission in your browser settings, then try again'
      : `Camera error: ${err.message || 'Unknown error'}`
  );
}

function setVowelIndicator(mode) {
  if (mode === 'A') {
    vowelIndicator.querySelector('span').textContent = 'A';
    vowelIndicator.classList.remove('hidden');
    document.body.classList.add('bg-success');
    console.log('[C8.2] ✅ Vowel indicator A SHOWN, LAR:', lastLar.toFixed(3));
  } else {
    vowelIndicator.classList.add('hidden');
    document.body.classList.remove('bg-success');
  }
}

gatekeeper.onEnter(STATES.CAMERA_ACTIVE, () => {
  console.log('[C8.2] Entered CAMERA_ACTIVE state');
});

gatekeeper.onExit(STATES.IDLE, () => {
  console.log('[C8.2] Exited IDLE state');
});

async function openAudioGate() {
  if (audioInitialized) {return;}
  try {
    await initAudioStream();
    audioInitialized = true;
  } catch (err) {
    console.error('[Audio] Failed to open audio stream:', err);
    gatekeeper.reset();
  }
}

function closeAudioGate() {
  if (!audioInitialized) {return;}
  closeAudioStream();
  audioInitialized = false;
  updatePitch(0);
}

function startPitchPolling() {
  stopPitchPolling();
  pitchInterval = setInterval(() => {
    if (gatekeeper.getState() !== STATES.MIC_OPEN) {
      stopPitchPolling();
      return;
    }
    const pitch = extractPitch();
    updatePitch(pitch);
  }, 100);
}

function stopPitchPolling() {
  if (pitchInterval) {
    clearInterval(pitchInterval);
    pitchInterval = null;
  }
}

gatekeeper.onEnter(STATES.MIC_OPEN, () => {
  console.log('[GateKeeper] Entered MIC_OPEN, mode:', gatekeeper.getMode());
  setVowelIndicator(gatekeeper.getMode());
  openAudioGate();
  startPitchPolling();
});

gatekeeper.onExit(STATES.MIC_OPEN, () => {
  setVowelIndicator(null);
  closeAudioGate();
  stopPitchPolling();
});

gatekeeper.onEnter(STATES.IDLE, () => {
  closeAudioGate();
  stopPitchPolling();
  setVowelIndicator(null);
});

function onFaceLandmarks(landmarks) {
  if (!sessionActive || !landmarks) {return;}

  lastFaceTime = performance.now();
  lastLar = computeLipAspectRatio(landmarks);
  updateLar(lastLar);

  const currentState = gatekeeper.getState();

  console.log('[C8.2] LAR:', lastLar.toFixed(3), 'State:', currentState);

  if (currentState === STATES.IDLE || currentState === STATES.CAMERA_ACTIVE) {
    if (lastLar >= lar_threshold.high) {
      console.log('[C8.2] 🟢 LAR >= high, opening mic for A');
      gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: 'A' });
    }
  }

  if (currentState === STATES.MIC_OPEN && gatekeeper.getMode() === 'A') {
    if (lastLar < lar_threshold.high) {
      console.log('[C8.2] 🔴 LAR dropped, fallback to IDLE');
      gatekeeper.reset();
    }
  }
}

function startMonitor() {
  stopMonitor();
  monitorTimer = setInterval(() => {
    if (!sessionActive) return;

    const now = performance.now();
    const faceGone = now - lastFaceTime > NO_FACE_TIMEOUT;

    if (faceGone) {
      showError(true, 'No Face Detected', 'Please position your face in the camera frame');
    } else if (lastLar <= lar_threshold.low) {
      showError(true, 'Mouth Closed', 'Please open your mouth to begin');
    } else {
      showError(false);
    }
  }, 500);
}

function stopMonitor() {
  if (monitorTimer) {
    clearInterval(monitorTimer);
    monitorTimer = null;
  }
}

async function startSession() {
  sessionActive = true;

  showError(false);
  updateLar(0);
  updatePitch(0);
  updateAccuracy(0);
  updateStars(0);

  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;

  console.log('[C8.2] Session started, gatekeeper → CAMERA_ACTIVE');
  startMonitor();

  gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);

  cameraController = initCamera(cameraFeed, onFaceLandmarks, showCameraError);
  if (cameraController) {
    cameraController.start();
  }
}

function stopSession() {
  sessionActive = false;
  stopMonitor();
  stopPitchPolling();

  gatekeeper.reset();

  if (cameraController) {
    cameraController.stop();
    cameraController = null;
  }

  showError(false);
}

btnStart.addEventListener('click', startSession);
btnStop.addEventListener('click', stopSession);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
