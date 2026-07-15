import './styles/main.css';
import { initCamera, computeLipAspectRatio, extractLipLandmarks, computeEuclideanDistance, getMouthMidpoint } from './utils/vision.js';
import { lar_threshold, f_min, f_max } from './utils/constants.js';
import { gatekeeper, STATES } from './utils/gatekeeper.js';
import { initAudioStream, closeAudioStream, extractPitch } from './utils/audio.js';
import { drawSilhouette } from './components/overlay.js';

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
const flashOverlay = $('flash-overlay');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

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
let faceEverDetected = false;
let mouthData = null;
let silhouetteRAF = null;
let overlayCtx = null;

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
  errorScreen.classList.toggle('opacity-100', show);
  errorScreen.classList.toggle('pointer-events-auto', show);
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
  if (audioInitialized) {return;}
  try {
    await initAudioStream();
    audioInitialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable, visual-only mode:', err.message);
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
      accuracyDisplay.textContent = 'SHRIILL';
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

function triggerFallback(mode) {
  const title = mode === 'A' ? 'Mouth Closed' : 'Mouth Open';
  const message = mode === 'A'
    ? 'Open your mouth wide for A'
    : 'Narrow your lips for I';

  showError(true, title, message);
  clearAllFlash();
  flashOverlay.classList.add('flash-error');
  closeAudioGate();
  gatekeeper.reset();
  outOfThresholdSince = 0;
  fallbackMode = mode;
  larValidSince = 0;

  if (errorHideTimer) {
    clearTimeout(errorHideTimer);
  }
  errorHideTimer = setTimeout(() => {
    if (fallbackMode) {
      showError(false);
      fallbackMode = null;
      larValidSince = 0;
    }
  }, 2000);
}

function clearAllFlash() {
  if (!flashOverlay) {return;}
  flashOverlay.classList.remove('flash-success', 'flash-warning', 'flash-error', 'flash-idle');
  if (flashTimeout) {
    clearTimeout(flashTimeout);
    flashTimeout = null;
  }
  flashActive = false;
}

function triggerFlash() {
  if (flashActive) {return;}
  if (!flashOverlay) {return;}
  flashActive = true;
  flashOverlay.classList.add('flash-success');
  flashTimeout = setTimeout(() => {
    flashOverlay.classList.remove('flash-success');
    flashActive = false;
    flashTimeout = null;
  }, 500);
}

function startSilhouetteLoop() {
  stopSilhouetteLoop();
  overlayCtx = overlayCanvas.getContext('2d');
  function loop() {
    if (!sessionActive) {return;}
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
  clearAllFlash();
});

gatekeeper.onEnter(STATES.IDLE, () => {
  closeAudioGate();
  stopPitchPolling();
  setVowelIndicator(null);
  clearAllFlash();
});

function onFaceLandmarks(landmarks) {
  if (!sessionActive || !landmarks) {return;}
  faceEverDetected = true;

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
    larDisplay.style.color = '#0D47A1';
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
        console.log(`[LAR Monitor] Fallback triggered: mode=A, LAR=${lastLar.toFixed(2)}, threshold=${lar_threshold.high}`);
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
        console.log(`[LAR Monitor] Fallback triggered: mode=I, LAR=${lastLar.toFixed(2)}, spread=${(lastMouthWidth / restingMouthWidth).toFixed(2)}x`);
        triggerFallback('I');
      }
    } else {
      outOfThresholdSince = 0;
    }
  }

  if (currentState !== STATES.MIC_OPEN) {
    if (currentState !== STATES.LAR_CHECK) {
      clearAllFlash();
      flashOverlay.classList.add('flash-error');
    }
  } else if (isF0Shrill) {
    clearAllFlash();
    flashOverlay.classList.add('flash-warning');
  } else if (isF0InRange && isF0Stable) {
    flashOverlay.classList.remove('flash-warning', 'flash-error', 'flash-idle');
    triggerFlash();
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

function startMonitor() {
  stopMonitor();
  monitorTimer = setInterval(() => {
    if (!sessionActive) return;

    const now = performance.now();
    const faceGone = now - lastFaceTime > NO_FACE_TIMEOUT;
    const monState = gatekeeper.getState();
    const monMode = gatekeeper.getMode();

    if (faceGone) {
      clearAllFlash();
      flashOverlay.classList.add('flash-idle');
      if (faceEverDetected) {
        showError(true, 'No Face Detected', 'Please position your face in the camera frame');
      } else {
        showError(false);
      }
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

async function startSession() {
  sessionActive = true;
  restingMouthWidth = Infinity;
  faceEverDetected = false;
  mouthData = null;

  showError(false);
  updateLar(0);
  updatePitch(0);
  updateAccuracy(0);
  updateStars(0);

  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;

  preGrantAudioPermission();

  startSilhouetteLoop();
  startMonitor();

  gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);

  cameraController = initCamera(cameraFeed, onFaceLandmarks, showCameraError);
  if (cameraController) {
    cameraController.start();
  }
}

function stopSession() {
  sessionActive = false;
  stopSilhouetteLoop();
  stopMonitor();
  stopPitchPolling();

  gatekeeper.reset();

  if (cameraController) {
    cameraController.stop();
    cameraController = null;
  }

  showError(false);
  isF0InRange = false;
  isF0Stable = false;
  isF0Shrill = false;
  clearAllFlash();
}

btnStart.addEventListener('click', startSession);
btnStop.addEventListener('click', stopSession);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
