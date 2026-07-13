import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { saveSession, getProfile, saveProfile } from './utils/db.js';

const LAR_THRESHOLD = 0.3;

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
let larThreshold = LAR_THRESHOLD;
let sessionActive = false;
let sessionData = [];

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
  if (!sessionActive) return;

  const lar = computeLipAspectRatio(landmarks);
  updateLar(lar);

  if (lar >= larThreshold) {
    showError(false);
    const pitch = extractPitch();
    updatePitch(pitch);

    sessionData.push({ lar, pitch, timestamp: Date.now() });
  } else {
    showError(true);
    closeAudioStream();
  }
}

async function startSession(userId) {
  sessionActive = true;
  sessionData = [];

  const profile = await getProfile(userId);
  if (profile) {
    larThreshold = profile.lar_threshold?.value ?? LAR_THRESHOLD;
  }

  showError(false);

  cameraController = initCamera(cameraFeed, onFaceLandmarks);
  cameraController.start();
}

function stopSession() {
  sessionActive = false;

  if (cameraController) {
    cameraController.stop();
    cameraController = null;
  }

  closeAudioStream();
  showError(false);
}

btnStart.addEventListener('click', () => startSession('default_user'));
btnStop.addEventListener('click', stopSession);
