import './styles/main.css';
import { initCamera, computeLipAspectRatio, extractLipLandmarks, computeEuclideanDistance, getMouthMidpoint } from './utils/vision.js';
import { lar_threshold, f_min, f_max } from './utils/constants.js';
import { gatekeeper, STATES } from './utils/gatekeeper.js';
import { initAudioStream, closeAudioStream, extractPitch, getPitchHz } from './utils/audio.js';
import { drawSilhouette } from './components/overlay.js';
import VocaToneGame from './components/game.js';

const $ = (id) => document.getElementById(id);

// ── Screen Router ────────────────────────────────────────────────────

const SCREENS = ['screen-dashboard', 'screen-dualsense', 'screen-vocatone'];

function showScreen(screenId) {
  SCREENS.forEach((id) => {
    const el = $(id);
    if (el) {
      el.classList.toggle('hidden', id !== screenId);
      el.classList.toggle('flex', id === screenId);
    }
  });
}

// ── Dual-Sense Elements ──────────────────────────────────────────────

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
const flashOverlay = $('flash-overlay');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

// ── VocaTone Elements ────────────────────────────────────────────────

const gameCanvas = $('game-canvas');
const vocPitchDisplay = $('voc-pitch-display');
const vocStatusDisplay = $('voc-status-display');
const btnVocStart = $('btn-voc-start');
const btnVocStop = $('btn-voc-stop');

// ── Navigation Elements ──────────────────────────────────────────────

const btnVocatone = $('btn-vocatone');
const btnDualsense = $('btn-dualsense');
const btnBackDualsense = $('btn-back-dualsense');
const btnBackVocatone = $('btn-back-vocatone');

// ── Shared State ─────────────────────────────────────────────────────

let cameraController = null;
let sessionActive = false;
let lastFaceTime = 0;
let lastLar = 0;
let lastMouthWidth = 0;
let monitorTimer = null;
let audioInitialized = false;
let pitchInterval = null;
let restingMouthWidth = Infinity;
let outOfThresholdSince = 0;
let fallbackMode = null;
let larValidSince = 0;
let errorHideTimer = null;
let isF0InRange = false;
let isF0Stable = false;
let isF0Shrill = false;
let flashActive = false;
let flashTimeout = null;
let mouthData = null;
let silhouetteRAF = null;
let overlayCtx = null;

// ── VocaTone State ─────────────────────────────────────────────────

let vocGame = null;
let vocActive = false;
let vocPitchInterval = null;

const NO_FACE_TIMEOUT = 1500;

// ════════════════════════════════════════════════════════════════════
// DUAL-SENSE FUNCTIONS (unchanged from original)
// ════════════════════════════════════════════════════════════════════

function updateLar(value) {
  larDisplay.textContent = value.toFixed(2);
}

function updatePitch(value) {
  pitchDisplay.textContent = (value !== null && value > 0)
    ? `${Math.round(value)} Hz`
    : '--';
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
  errorScreen.classList.toggle('opacity-100', show);
  errorScreen.classList.toggle('pointer-events-auto', show);
  if (show) {
    if (title) { errorTitle.textContent = title; }
    if (message) { errorMessage.textContent = message; }
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
  if (mode === 'A' || mode === 'I') {
    vowelIndicator.querySelector('span').textContent = mode;
    vowelIndicator.classList.remove('hidden');
  } else {
    vowelIndicator.classList.add('hidden');
  }
}

async function preGrantAudioPermission() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach(t => t.stop());
  } catch (_) {}
}

async function openAudioGate() {
  if (audioInitialized) { return; }
  try {
    await initAudioStream();
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable, visual-only mode:', err.message);
  }
}

function closeAudioGate() {
  if (!audioInitialized) { return; }
  closeAudioStream();
  audioInitialized = false;
  updatePitch(0);
}

function startPitchPolling() {
  stopPitchPolling();
  isF0InRange = false;
  isF0Stable = false;
  isF0Shrill = false;
  let stableCount = 0;
  pitchInterval = setInterval(() => {
    if (gatekeeper.getState() !== STATES.MIC_OPEN) {
      stopPitchPolling();
      return;
    }
    const pitch = extractPitch();
    updatePitch(pitch);
    if (pitch > f_max) {
      isF0Shrill = true;
      isF0InRange = false;
      isF0Stable = false;
      stableCount = 0;
      accuracyDisplay.textContent = 'SHRILL';
      accuracyDisplay.style.color = '#EAB308';
    } else if (pitch >= f_min) {
      isF0Shrill = false;
      isF0InRange = true;
      stableCount++;
      if (stableCount >= 3) {
        isF0Stable = true;
        accuracyDisplay.textContent = 'STABLE';
        accuracyDisplay.style.color = '#22C55E';
      }
      // Update stars based on LAR accuracy + pitch stability
      const larAcc = Math.min(100, Math.max(0, (1 - Math.abs(lastLar - lar_threshold.high) / lar_threshold.high) * 100));
      const pitchStability = Math.min(3, Math.floor(stableCount / 2));
      updateStars(pitchStability > 0 ? Math.min(3, Math.floor(larAcc / 33) + 1) : 0);
    } else {
      isF0Shrill = false;
      isF0InRange = false;
      isF0Stable = false;
      stableCount = 0;
      accuracyDisplay.textContent = '--';
      accuracyDisplay.style.color = '#94A3B8';
    }
  }, 100);
}

function stopPitchPolling() {
  if (pitchInterval) {
    clearInterval(pitchInterval);
    pitchInterval = null;
  }
}

function clearAllFlash() {
  if (!flashOverlay) { return; }
  flashOverlay.classList.remove('flash-success', 'flash-warning', 'flash-error', 'flash-idle');
  if (flashTimeout) {
    clearTimeout(flashTimeout);
    flashTimeout = null;
  }
  flashActive = false;
}

function triggerFlash(type) {
  if (flashActive) { return; }
  if (!flashOverlay) { return; }
  flashActive = true;
  const cls = type === 'warning' ? 'flash-warning' : 'flash-success';
  flashOverlay.classList.add(cls);
  flashTimeout = setTimeout(() => {
    flashOverlay.classList.remove(cls);
    flashActive = false;
    flashTimeout = null;
  }, 500);
}

function triggerFallback(mode) {
  const title = mode === 'A' ? 'Mouth Closed' : 'Mouth Open';
  const message = mode === 'A'
    ? 'Open your mouth wide for A'
    : 'Narrow your lips for I';

  showError(true, title, message);
  closeAudioGate();
  gatekeeper.reset();
  clearAllFlash();
  flashOverlay.classList.add('flash-error');
  outOfThresholdSince = 0;
  fallbackMode = mode;
  larValidSince = 0;

  if (errorHideTimer) { clearTimeout(errorHideTimer); }
  errorHideTimer = setTimeout(() => {
    if (fallbackMode) {
      showError(false);
      fallbackMode = null;
      larValidSince = 0;
    }
  }, 2000);
}

function startSilhouetteLoop() {
  stopSilhouetteLoop();
  overlayCtx = overlayCanvas.getContext('2d');
  function loop() {
    if (!sessionActive) { return; }
    silhouetteRAF = requestAnimationFrame(loop);
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    const now = performance.now();
    const isFaceDetected = now - lastFaceTime < NO_FACE_TIMEOUT;
    drawSilhouette(overlayCtx, overlayCanvas.width, overlayCanvas.height, isFaceDetected, isFaceDetected ? mouthData : null);
  }
  loop();
}

function stopSilhouetteLoop() {
  if (silhouetteRAF) {
    cancelAnimationFrame(silhouetteRAF);
    silhouetteRAF = null;
  }
  if (overlayCtx) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
}

function startMonitor() {
  stopMonitor();
  monitorTimer = setInterval(() => {
    if (!sessionActive) { return; }

    const now = performance.now();
    const faceGone = now - lastFaceTime > NO_FACE_TIMEOUT;
    const monState = gatekeeper.getState();
    const monMode = gatekeeper.getMode();

    if (faceGone) {
      clearAllFlash();
      flashOverlay.classList.add('flash-idle');
      showError(false);
    } else if (monState === STATES.MIC_OPEN && monMode === 'I') {
      if (lastMouthWidth <= restingMouthWidth * 1.15) {
        showError(true, 'Not Spreading', 'Spread your lips wide and grin for /i/');
      } else if (lastLar >= lar_threshold.high) {
        showError(true, 'Too Wide', 'Narrow your mouth — you are opening for /a/');
      } else {
        showError(false);
      }
    } else if (monState === STATES.MIC_OPEN && monMode === 'A') {
      if (lastLar < lar_threshold.high) {
        showError(true, 'Mouth Closing', 'Keep your mouth wide for /a/');
      } else {
        showError(false);
      }
    } else if (!fallbackMode && lastLar <= lar_threshold.low) {
      showError(true, 'Mouth Closed', 'Open your mouth to begin');
    } else if (!fallbackMode) {
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

gatekeeper.onEnter(STATES.MIC_OPEN, () => {
  setVowelIndicator(gatekeeper.getMode());
  openAudioGate();
  startPitchPolling();
});

gatekeeper.onExit(STATES.MIC_OPEN, () => {
  setVowelIndicator(null);
  closeAudioGate();
  stopPitchPolling();
  clearAllFlash();
});

gatekeeper.onEnter(STATES.IDLE, () => {
  closeAudioGate();
  stopPitchPolling();
  setVowelIndicator(null);
  clearAllFlash();
});

function onFaceLandmarks(landmarks) {
  if (!sessionActive || !landmarks) { return; }

  lastFaceTime = performance.now();
  lastLar = computeLipAspectRatio(landmarks);
  updateLar(lastLar);
  mouthData = getMouthMidpoint(landmarks);

  const lipPoints = extractLipLandmarks(landmarks);
  lastMouthWidth = lipPoints ? computeEuclideanDistance(lipPoints.left, lipPoints.right) : 0;

  if (lastMouthWidth > 0 && lastMouthWidth < restingMouthWidth) {
    restingMouthWidth = lastMouthWidth;
  }

  const currentState = gatekeeper.getState();
  const currentMode = gatekeeper.getMode();

  const SPREAD_TRIGGER = 1.3;
  const SPREAD_SUSTAIN = 1.15;
  const isMiddleLar = lastLar >= lar_threshold.low && lastLar < lar_threshold.high;
  const isMouthSpread = lastMouthWidth > restingMouthWidth * SPREAD_TRIGGER;

  if (currentState === STATES.MIC_OPEN && currentMode === 'I') {
    if (lastMouthWidth > restingMouthWidth * SPREAD_SUSTAIN && lastLar < lar_threshold.high) {
      larDisplay.style.color = '#22C55E';
    } else {
      larDisplay.style.color = '#EAB308';
    }
  } else if (currentState === STATES.MIC_OPEN && currentMode === 'A') {
    if (lastLar >= lar_threshold.high) {
      larDisplay.style.color = '#22C55E';
    } else {
      larDisplay.style.color = '#EAB308';
    }
  } else if (lastLar >= lar_threshold.high) {
    larDisplay.style.color = '#22C55E';
  } else if (lastLar > lar_threshold.low) {
    larDisplay.style.color = '#EAB308';
  } else {
    larDisplay.style.color = '#94A3B8';
  }

  if (currentState === STATES.IDLE) {
    if (lastLar >= lar_threshold.high) {
      gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);
    } else if (isMiddleLar && isMouthSpread) {
      gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);
    }
  }

  if (currentState === STATES.CAMERA_ACTIVE) {
    if (lastLar >= lar_threshold.high && fallbackMode !== 'A') {
      gatekeeper.transitionTo(STATES.LAR_CHECK, { mode: 'A' });
    } else if (isMiddleLar && isMouthSpread && fallbackMode !== 'I') {
      gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: 'I' });
    }
  }

  if (currentState === STATES.LAR_CHECK) {
    const checkMode = gatekeeper.getMode();
    if (checkMode === 'A' && lastLar >= lar_threshold.high) {
      gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: 'A' });
    } else {
      gatekeeper.transitionTo(STATES.IDLE);
    }
  }

  if (sessionActive && audioInitialized && currentState === STATES.MIC_OPEN && currentMode === 'A') {
    const isOutOfRange = lastLar < lar_threshold.high;
    if (isOutOfRange) {
      if (outOfThresholdSince === 0) {
        outOfThresholdSince = performance.now();
      } else if (performance.now() - outOfThresholdSince > 300) {
        triggerFallback('A');
      }
    } else {
      outOfThresholdSince = 0;
    }
  }

  if (sessionActive && audioInitialized && currentState === STATES.MIC_OPEN && currentMode === 'I') {
    const isOutOfRange = lastMouthWidth <= restingMouthWidth * SPREAD_SUSTAIN || lastLar >= lar_threshold.high;
    if (isOutOfRange) {
      if (outOfThresholdSince === 0) {
        outOfThresholdSince = performance.now();
      } else if (performance.now() - outOfThresholdSince > 300) {
        triggerFallback('I');
      }
    } else {
      outOfThresholdSince = 0;
    }
  }

  if (currentState !== STATES.MIC_OPEN) {
    if (currentState !== STATES.LAR_CHECK) {
      clearAllFlash();
      if (fallbackMode) {
        flashOverlay.classList.add('flash-error');
      } else {
        flashOverlay.classList.add('flash-idle');
      }
    }
  } else if (isF0Shrill) {
    clearAllFlash();
    flashOverlay.classList.add('flash-warning');
  } else if (isF0InRange && isF0Stable) {
    flashOverlay.classList.remove('flash-warning', 'flash-error', 'flash-idle');
    triggerFlash('success');
  } else {
    clearAllFlash();
  }

  if (fallbackMode) {
    let isValid = false;
    if (fallbackMode === 'A') {
      isValid = lastLar >= lar_threshold.high;
    } else if (fallbackMode === 'I') {
      isValid = isMiddleLar && isMouthSpread;
    }

    if (isValid) {
      if (larValidSince === 0) {
        larValidSince = performance.now();
      } else if (performance.now() - larValidSince > 1000) {
        showError(false);
        fallbackMode = null;
        larValidSince = 0;
        if (errorHideTimer) {
          clearTimeout(errorHideTimer);
          errorHideTimer = null;
        }
      }
    } else {
      larValidSince = 0;
    }
  }
}

async function startDualSenseSession() {
  sessionActive = true;
  restingMouthWidth = Infinity;
  mouthData = null;

  showError(false);
  updateLar(0);
  updatePitch(0);
  updateAccuracy(0);
  updateStars(0);

  overlayCanvas.width = overlayCanvas.clientWidth;
  overlayCanvas.height = overlayCanvas.clientHeight;

  preGrantAudioPermission();

  startSilhouetteLoop();
  startMonitor();

  gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);

  cameraController = initCamera(cameraFeed, {
    onFaceLandmarks,
    onNoFace: () => {},
  });

  try {
    await cameraController.start();
  } catch (err) {
    showCameraError(err);
    sessionActive = false;
  }
}

function stopDualSenseSession() {
  sessionActive = false;

  stopSilhouetteLoop();
  stopMonitor();
  stopPitchPolling();

  gatekeeper.reset();

  showError(false);
  isF0InRange = false;
  isF0Stable = false;
  isF0Shrill = false;
  clearAllFlash();

  if (cameraController) {
    cameraController.stop();
    cameraController = null;
  }

  if (audioInitialized) {
    closeAudioStream();
    audioInitialized = false;
  }

  updateLar(0);
  updatePitch(0);
  updateStars(0);
}

// ════════════════════════════════════════════════════════════════════
// VOCATONE FUNCTIONS
// ════════════════════════════════════════════════════════════════════

function startVocaTone() {
  if (vocActive) { return; }
  vocActive = true;

  gameCanvas.width = gameCanvas.clientWidth;
  gameCanvas.height = gameCanvas.clientHeight;

  vocGame = new VocaToneGame(gameCanvas);
  vocGame.setTargetRange(f_min, f_max);

  updateVocPitch(0);
  updateVocStatus('Idle');

  initAudioStream()
    .then(() => {
      vocGame.startLoop(getPitchHz);
      startVocPitchDisplay();
      updateVocStatus('Active');
    })
    .catch((err) => {
      console.warn('[VocaTone] Mic unavailable:', err.message);
      vocGame.startLoop(() => 0);
      startVocPitchDisplay();
      updateVocStatus('No Mic');
    });
}

function stopVocaTone() {
  if (!vocActive) { return; }
  vocActive = false;

  if (vocGame) {
    vocGame.destroy();
    vocGame = null;
  }

  stopVocPitchDisplay();

  if (audioInitialized) {
    closeAudioStream();
    audioInitialized = false;
  }

  updateVocPitch(0);
  updateVocStatus('Idle');
  updateStars(0);

  const ctx = gameCanvas.getContext('2d');
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function updateVocPitch(value) {
  vocPitchDisplay.textContent = (value !== null && value > 0)
    ? `${Math.round(value)} Hz`
    : '--';
}

function updateVocStatus(text) {
  vocStatusDisplay.textContent = text;
}

function startVocPitchDisplay() {
  stopVocPitchDisplay();
  let vocStableCount = 0;
  vocPitchInterval = setInterval(() => {
    if (!vocActive) {
      stopVocPitchDisplay();
      return;
    }
    const pitch = extractPitch();
    updateVocPitch(pitch);
    updateVocStatus(pitch > 0 ? 'Active' : 'Idle');
    if (pitch >= f_min && pitch <= f_max) {
      vocStableCount++;
      updateStars(Math.min(3, Math.floor(vocStableCount / 3) + 1));
    } else {
      vocStableCount = 0;
      updateStars(0);
    }
  }, 150);
}

function stopVocPitchDisplay() {
  if (vocPitchInterval) {
    clearInterval(vocPitchInterval);
    vocPitchInterval = null;
  }
}

// ════════════════════════════════════════════════════════════════════
// SCREEN NAVIGATION
// ════════════════════════════════════════════════════════════════════

function navigateToDashboard() {
  stopDualSenseSession();
  stopVocaTone();

  if (audioInitialized) {
    closeAudioStream();
    audioInitialized = false;
  }

  showScreen('screen-dashboard');
}

function navigateToVocaTone() {
  navigateToDashboard();
  showScreen('screen-vocatone');
}

function navigateToDualSense() {
  navigateToDashboard();
  showScreen('screen-dualsense');
}

// ── Event Listeners ──────────────────────────────────────────────────

btnVocatone.addEventListener('click', navigateToVocaTone);
btnDualsense.addEventListener('click', navigateToDualSense);
btnBackDualsense.addEventListener('click', navigateToDashboard);
btnBackVocatone.addEventListener('click', navigateToDashboard);

// Dual-Sense controls
btnStart.addEventListener('click', startDualSenseSession);
btnStop.addEventListener('click', stopDualSenseSession);

// VocaTone controls
btnVocStart.addEventListener('click', startVocaTone);
btnVocStop.addEventListener('click', stopVocaTone);

// ── Init: start on dashboard ─────────────────────────────────────────

showScreen('screen-dashboard');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
