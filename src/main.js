import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { getProfile } from './utils/db.js';

const lar_threshold = 0.3;

const $ = (id) => document.getElementById(id);

const cameraFeed = $('camera-feed');
const overlayCanvas = $('overlay-canvas');
const larDisplay = $('lar-display');
const pitchDisplay = $('pitch-display');
const accuracyDisplay = $('accuracy-display');
const starDisplay = $('star-display');
const errorScreen = $('error-screen');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

let cameraController = null;
let threshold = lar_threshold;
let sessionActive = false;
let audioInitialized = false;

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

function showError(show) {
  errorScreen.classList.toggle('hidden', !show);
}

async function onFaceLandmarks(landmarks) {
  if (!sessionActive) {
    return;
  }

  const lar = computeLipAspectRatio(landmarks);
  updateLar(lar);

  if (lar >= threshold) {
    showError(false);

    if (!audioInitialized) {
      await initAudioStream();
      audioInitialized = true;
    }

    const pitch = extractPitch();
    updatePitch(pitch);
  } else {
    showError(true);
    if (audioInitialized) {
      closeAudioStream();
      audioInitialized = false;
    }
  }
}

async function startSession(userId) {
  sessionActive = true;
  audioInitialized = false;

  const profile = await getProfile(userId);
  if (profile) {
    threshold = profile.lar_threshold?.value ?? lar_threshold;
  }

  showError(false);
  updateAccuracy(0);
  updateStars(0);

  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;

  cameraController = initCamera(cameraFeed, onFaceLandmarks);
  cameraController.start();
}

function stopSession() {
  sessionActive = false;

  if (cameraController) {
    cameraController.stop();
    cameraController = null;
  }

  if (audioInitialized) {
    closeAudioStream();
    audioInitialized = false;
  }

  showError(false);
}

btnStart.addEventListener('click', () => startSession('default_user'));
btnStop.addEventListener('click', stopSession);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
