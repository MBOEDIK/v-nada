import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';

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
let noFaceTimer = null;

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

function onFaceLandmarks(landmarks) {
  if (!sessionActive) return;

  lastFaceTime = performance.now();
  const lar = computeLipAspectRatio(landmarks);
  updateLar(lar);
  showError(false);
}

function startNoFaceMonitor() {
  stopNoFaceMonitor();
  noFaceTimer = setInterval(() => {
    if (!sessionActive) return;
    if (performance.now() - lastFaceTime > NO_FACE_TIMEOUT) {
      showError(true, 'No Face Detected', 'Please position your face in the camera frame');
    }
  }, 500);
}

function stopNoFaceMonitor() {
  if (noFaceTimer) {
    clearInterval(noFaceTimer);
    noFaceTimer = null;
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

  startNoFaceMonitor();

  cameraController = initCamera(cameraFeed, onFaceLandmarks, showCameraError);
  if (cameraController) {
    cameraController.start();
  }
}

function stopSession() {
  sessionActive = false;
  stopNoFaceMonitor();

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
