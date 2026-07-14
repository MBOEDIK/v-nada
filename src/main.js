import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { lar_threshold } from './utils/constants.js';

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
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

let cameraController = null;
let sessionActive = false;
let lastFaceTime = 0;
let lastLar = 0;
let monitorTimer = null;

const NO_FACE_TIMEOUT = 1500;
const MOUTH_CLOSED_THRESHOLD = lar_threshold.low;

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

function onFaceLandmarks(landmarks) {
  if (!sessionActive || !landmarks) {return;}

  lastFaceTime = performance.now();
  lastLar = computeLipAspectRatio(landmarks);
  updateLar(lastLar);
}

function startMonitor() {
  stopMonitor();
  monitorTimer = setInterval(() => {
    if (!sessionActive) return;

    const now = performance.now();
    const faceGone = now - lastFaceTime > NO_FACE_TIMEOUT;

    if (faceGone) {
      showError(true, 'No Face Detected', 'Please position your face in the camera frame');
    } else if (lastLar <= MOUTH_CLOSED_THRESHOLD) {
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

  startMonitor();

  cameraController = initCamera(cameraFeed, onFaceLandmarks, showCameraError);
  if (cameraController) {
    cameraController.start();
  }
}

function stopSession() {
  sessionActive = false;
  stopMonitor();

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
