import './styles/main.css';
import { initCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { getProfile } from './utils/db.js';
import gatekeeper, { STATES } from './utils/gatekeeper.js';

/** Default LAR threshold for vowel /a/ (fallback when no IndexedDB profile). */
const DEFAULT_LAR_THRESHOLD = 0.3;

/** How long (ms) the app tolerates a missing face before visual fallback. */
const NO_FACE_TOLERANCE_MS = 3000;

/**
 * Debounce window (ms) for LAR threshold monitoring.
 * Prevents rapid flicker of the error screen when LAR oscillates
 * around the threshold boundary due to micro-movements of the lips.
 * Fallback only executes after LAR stays below threshold for this duration.
 */
const LAR_DEBOUNCE_MS = 300;

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

/**
 * Handle for the LAR-drop debounce timer.
 * While this is non-null, a potential fallback is pending — new LAR-below-threshold
 * events are ignored until the timer fires or is cancelled.
 */
let lar_fallback_timer = null;

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

// ── Error Screen (Opacity-based, 700ms CSS transition) ──────────────
// Uses opacity + pointer-events instead of Tailwind `hidden` (display:none)
// so the browser can interpolate the transition over 700ms.
function showError() {
  errorScreen.classList.remove('opacity-0', 'pointer-events-none');
  errorScreen.classList.add('opacity-100', 'pointer-events-auto');
}

function hideError() {
  errorScreen.classList.remove('opacity-100', 'pointer-events-auto');
  errorScreen.classList.add('opacity-0', 'pointer-events-none');
}

// ── No-Face Tolerance Timer ─────────────────────────────────────────
// After 3 s without a detected face the camera-view background shifts
// to the muted token (#F8FAFC).  Only applies in CAMERA_ACTIVE state.
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

// ── LAR Debounce Mechanism ──────────────────────────────────────────
// When LAR drops below threshold during an active audio zone
// (LAR_CHECK / MIC_OPEN / SESSION_ACTIVE), the fallback is deferred
// by LAR_DEBOUNCE_MS.  If LAR recovers above threshold within that
// window the timer is cancelled — no fallback occurs, no flicker.

function startLarDebounce() {
  if (lar_fallback_timer !== null) {
    return;
  }
  lar_fallback_timer = setTimeout(() => {
    lar_fallback_timer = null;
    executeFallback();
  }, LAR_DEBOUNCE_MS);
}

function cancelLarDebounce() {
  if (lar_fallback_timer !== null) {
    clearTimeout(lar_fallback_timer);
    lar_fallback_timer = null;
  }
}

// ── Instant Fallback — Condition A (face still detected) ────────────
// Called when the debounce timer fires: LAR has been below threshold
// for 300 ms continuously while the face is still in frame.
//
// Executes three concurrent actions:
//   1. Close audio gate  — microphone off, f0 extraction stops.
//   2. Visual error flash — red overlay via #error-screen.
//   3. State degradation  — fall back from active zone to CAMERA_ACTIVE.
//
// FaceMesh pipeline keeps running in the background so that when the
// user re-opens their mouth the session can resume automatically.

function executeFallback() {
  const current_state = gatekeeper.getState();

  // Guard: only execute when in an active audio zone
  if (current_state !== STATES.LAR_CHECK
      && current_state !== STATES.MIC_OPEN
      && current_state !== STATES.SESSION_ACTIVE) {
    return;
  }

  // 1. Close audio gate
  if (audio_initialized) {
    closeAudioStream();
    audio_initialized = false;
  }

  // 2. Visual error flash (smooth 700ms fade-in via CSS transition)
  showError();

  // 3. State degradation: degrade back to CAMERA_ACTIVE
  //    Camera stays on; FaceMesh keeps monitoring for mouth reopening.
  gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE);
}

// ── Instant Fallback — Condition B (face lost entirely) ─────────────
// Hard reset to IDLE when no face landmarks are detected while in an
// active audio zone.  All sensors (camera + microphone) are shut down.
// A full session restart via the Start button is required afterwards.

function executeHardReset() {
  // Close audio if open
  if (audio_initialized) {
    closeAudioStream();
    audio_initialized = false;
  }

  audio_initializing = false;
  cancelLarDebounce();
  resetNoFaceTimer();
  hideError();

  // Hard reset state machine → IDLE
  gatekeeper.reset();

  // Stop camera + FaceMesh pipeline
  if (camera_controller) {
    camera_controller.stop();
    camera_controller = null;
  }

  session_active = false;
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
  const in_active_zone = current_state === STATES.LAR_CHECK
    || current_state === STATES.MIC_OPEN
    || current_state === STATES.SESSION_ACTIVE;

  // ── Sequential Validation Gate ──────────────────────────────────
  // When state is CAMERA_ACTIVE and LAR meets the threshold,
  // advance to LAR_CHECK which "opens the audio gate".
  if (current_state === STATES.CAMERA_ACTIVE && lar >= threshold) {
    gatekeeper.transitionTo(STATES.LAR_CHECK);
  }

  // ── LAR Threshold Branching ────────────────────────────────────
  if (lar >= threshold) {
    // LAR is valid — cancel any pending fallback, hide error, resume pipeline
    cancelLarDebounce();
    hideError();

    // Lazy-init microphone (guard against concurrent init calls)
    if (!audio_initialized && !audio_initializing
        && gatekeeper.getState() === STATES.LAR_CHECK) {
      audio_initializing = true;
      initAudioStream()
        .then(() => {
          // Only open audio if session is still live and LAR is still valid
          if (session_active) {
            audio_initialized = true;
          } else {
            // Session ended while mic was initializing — clean up immediately
            closeAudioStream();
          }
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
    // ── LAR dropped below threshold ──────────────────────────────
    if (in_active_zone) {
      // Condition A zone: debounce before executing fallback.
      // This prevents rapid flicker from micro-movements around the boundary.
      startLarDebounce();
    } else {
      // Not yet in an active audio zone (e.g. still in CAMERA_ACTIVE
      // before first LAR_CHECK transition). Show error immediately.
      showError();
    }
  }
}

// ── No-Face Callback ────────────────────────────────────────────────
function onNoFace() {
  if (!session_active) {
    return;
  }

  const current_state = gatekeeper.getState();

  // Condition B: Face lost while in an active audio zone
  // (LAR_CHECK, MIC_OPEN, or SESSION_ACTIVE).
  // Hard reset — shut down all sensors immediately.
  if (current_state === STATES.LAR_CHECK
      || current_state === STATES.MIC_OPEN
      || current_state === STATES.SESSION_ACTIVE) {
    executeHardReset();
    return;
  }

  // In CAMERA_ACTIVE: use the softer 3 s tolerance timer.
  // Camera stays on, background fades to muted after the window.
  startNoFaceTimer();
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

  hideError();
  updateAccuracy(0);
  updateStars(0);
  resetNoFaceTimer();
  cancelLarDebounce();

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
  cancelLarDebounce();
  resetNoFaceTimer();
  hideError();

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
