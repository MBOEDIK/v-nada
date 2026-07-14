import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { getProfile } from './utils/db.js';
import gatekeeper, { STATES } from './utils/gatekeeper.js';

/** Default LAR threshold for vowel /a/ (fallback when no IndexedDB profile). */
const DEFAULT_LAR_THRESHOLD = 0.3;

/** How long (ms) the app tolerates a missing face before visual fallback. */
const NO_FACE_TOLERANCE_MS = 3000;

const $ = (id) => document.getElementById(id);

// ── DOM References ──────────────────────────────────────────────────
const cameraFeed = $('camera-feed');
const overlayCanvas = $('overlay-canvas');
const larDisplay = $('lar-display');
const pitchDisplay = $('pitch-display');
const accuracyDisplay = $('accuracy-display');
const starDisplay = $('star-display');
const errorScreen = $('error-screen');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');
const cameraView = $('camera-view');

// ── Session State ───────────────────────────────────────────────────
let camera_controller = null;
let threshold = DEFAULT_LAR_THRESHOLD;
let session_active = false;
let audio_initialized = false;
let audio_initializing = false;
let no_face_timer = null;

// ── UI Helpers ──────────────────────────────────────────────────────
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

// ── No-Face Tolerance Timer ─────────────────────────────────────────
// After 3 s without a detected face the camera-view background shifts
// to the muted token (#F8FAFC).  State stays at CAMERA_ACTIVE.
function startNoFaceTimer() {
  if (no_face_timer !== null) {
    return;
  }
  no_face_timer = setTimeout(() => {
    cameraView.style.backgroundColor = '#F8FAFC';
    no_face_timer = null;
  }, NO_FACE_TOLERANCE_MS);
}

function resetNoFaceTimer() {
  if (no_face_timer !== null) {
    clearTimeout(no_face_timer);
    no_face_timer = null;
  }
  cameraView.style.backgroundColor = '';
}

// ── FaceLandmarks Callback (invoked per processed frame) ────────────
function onFaceLandmarks(landmarks) {
  if (!session_active) {
    return;
  }

  // Face detected → cancel no-face timer, restore background
  resetNoFaceTimer();

  const lar = computeLipAspectRatio(landmarks);
  updateLar(lar);

  const current_state = gatekeeper.getState();

  // ── Sequential Validation Gate ──────────────────────────────────
  // When state is CAMERA_ACTIVE and LAR meets the threshold,
  // advance to LAR_CHECK which "opens the audio gate".
  if (current_state === STATES.CAMERA_ACTIVE && lar >= threshold) {
    gatekeeper.transitionTo(STATES.LAR_CHECK);
  }

  // ── Audio Gate Control ──────────────────────────────────────────
  if (lar >= threshold) {
    showError(false);

    // Lazy-init microphone (guard against concurrent init calls)
    if (!audio_initialized && !audio_initializing
        && gatekeeper.getState() === STATES.LAR_CHECK) {
      audio_initializing = true;
      initAudioStream()
        .then(() => {
          audio_initialized = true;
          audio_initializing = false;
        })
        .catch(() => {
          console.warn('Audio stream initialization failed');
          audio_initializing = false;
        });
    }

    // Extract pitch once the audio pipeline is live
    if (audio_initialized) {
      const pitch = extractPitch();
      updatePitch(pitch);
    }
  } else {
    showError(true);

    // Instant Fallback: close mic immediately when LAR drops below threshold
    if (audio_initialized) {
      closeAudioStream();
      audio_initialized = false;
    }
  }
}

// ── No-Face Callback ────────────────────────────────────────────────
function onNoFace() {
  if (session_active) {
    startNoFaceTimer();
  }
}

// ── Session Lifecycle ───────────────────────────────────────────────
async function startSession(user_id) {
  session_active = true;
  audio_initialized = false;
  audio_initializing = false;

  // Load optional per-user profile for custom threshold
  const profile = await getProfile(user_id);
  if (profile) {
    threshold = profile.lar_threshold?.value ?? DEFAULT_LAR_THRESHOLD;
  }

  showError(false);
  updateAccuracy(0);
  updateStars(0);
  resetNoFaceTimer();

  // Sync overlay canvas pixel buffer to its CSS layout size
  overlayCanvas.width = overlayCanvas.clientWidth;
  overlayCanvas.height = overlayCanvas.clientHeight;

  // State machine: IDLE → CAMERA_ACTIVE
  gatekeeper.reset();
  gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);

  // Start FaceMesh + camera pipeline
  camera_controller = initCamera(cameraFeed, {
    onFaceLandmarks,
    onNoFace,
    overlayCanvas,
  });

  try {
    await camera_controller.start();
  } catch (err) {
    console.error(`Camera start failed: ${err.message}`);
    session_active = false;
  }
}

function stopSession() {
  session_active = false;

  if (camera_controller) {
    camera_controller.stop();
    camera_controller = null;
  }

  if (audio_initialized) {
    closeAudioStream();
    audio_initialized = false;
  }

  audio_initializing = false;
  resetNoFaceTimer();
  showError(false);

  gatekeeper.reset();

  updateLar(0);
  updatePitch(0);
}

// ── Event Listeners ─────────────────────────────────────────────────
btnStart.addEventListener('click', () => startSession('default_user'));
btnStop.addEventListener('click', stopSession);

// ── Service Worker Registration ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
