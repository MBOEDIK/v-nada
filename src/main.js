import './styles/main.css';
import { GateKeeper, STATES } from './utils/gatekeeper.js';
import { initCamera, stopCamera, computeLipAspectRatio } from './utils/vision.js';
import { initAudioStream, closeAudioStream, extractPitch, calibrateAmbientNoise } from './utils/audio.js';
import { getProfile, saveProfile, getDefaultProfile } from './utils/db.js';
import { lar_threshold, f_max } from './utils/constants.js';
import { VocaTone } from './games/vocatone.js';

const $ = function (id) { return document.getElementById(id); };

const cameraFeed = $('camera-feed');
const overlayCanvas = $('overlay-canvas');
const checkmarkCanvas = $('checkmark-canvas');
const larDisplay = $('lar-display');
const pitchDisplay = $('pitch-display');
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
const gameCanvas = $('game-canvas');
const statusDisplay = $('status-display');

let vocatone_game = null;
let vocatone_running = false;

let audio_initialized = false;
let audio_initializing = false;
let out_of_threshold_since = 0;
const LAR_DEBOUNCE_MS = 300;
let stable_pitch_count = 0;
const STABLE_PITCH_MIN = 5;

const gatekeeper = new GateKeeper();
let camera_ctrl = null;
let pitch_poll_id = null;
let flash_timeout = null;
let current_flash = null;
let crosshair_anim_id = null;
let canvas_ctx = null;
let checkmark_ctx = null;
let show_arrow = false;
let resize_observer = null;
let face_paused = false;

function updateLar(value) { larDisplay.textContent = value.toFixed(2); }
function updatePitch(value) { pitchDisplay.textContent = value > 0 ? `${Math.round(value)} Hz` : '--'; }
function showError(show, title, msg) {
  if (!show) { errorScreen.classList.add('hidden'); return; }
  errorScreen.classList.remove('hidden');
  if (title) { errorScreen.querySelector('h2').textContent = title; }
  if (msg) { errorScreen.querySelector('p').textContent = msg; }
}

function setFlash(type) {
  if (flash_timeout) { clearTimeout(flash_timeout); flash_timeout = null; }
  if (current_flash) { overlayCanvas.classList.remove(current_flash); }
  if (!type) { current_flash = null; return; }
  overlayCanvas.classList.add(type);
  current_flash = type;
  flash_timeout = setTimeout(function () {
    overlayCanvas.classList.remove(type);
    current_flash = null;
    flash_timeout = null;
  }, 400);
}

function drawCrosshair(lar) {
  if (!canvas_ctx) { return; }
  const w = overlayCanvas.width;
  const h = overlayCanvas.height;

  const cx = w / 2;
  const cy = h / 2;
  const ratio = Math.min(1, Math.max(0, (lar - 0.1) / 0.6));
  const barLength = 20 + ratio * 30;
  const gap = 6;

  canvas_ctx.strokeStyle = 'rgba(13, 71, 161, 0.6)';
  canvas_ctx.lineWidth = 3;
  canvas_ctx.beginPath();
  canvas_ctx.moveTo(cx - barLength - gap, cy);
  canvas_ctx.lineTo(cx - gap, cy);
  canvas_ctx.moveTo(cx + gap, cy);
  canvas_ctx.lineTo(cx + barLength + gap, cy);
  canvas_ctx.moveTo(cx, cy - barLength - gap);
  canvas_ctx.lineTo(cx, cy - gap);
  canvas_ctx.moveTo(cx, cy + gap);
  canvas_ctx.lineTo(cx, cy + barLength + gap);
  canvas_ctx.stroke();

  canvas_ctx.strokeStyle = 'rgba(13, 71, 161, 0.3)';
  canvas_ctx.lineWidth = 1;
  canvas_ctx.setLineDash([4, 4]);
  canvas_ctx.beginPath();
  canvas_ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  canvas_ctx.stroke();
  canvas_ctx.setLineDash([]);
}

let silhouette_pulse = 0;

function drawSilhouette(state) {
  if (!canvas_ctx) { return; }
  const w = overlayCanvas.width;
  const h = overlayCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const pad = 48;
  const rx = Math.max(20, Math.min(w * 0.25, (w - pad * 2) / 2));
  const ry = Math.max(14, Math.min(h * 0.15, (h - pad * 2) / 2));

  let color;
  let lineWidth;
  let alpha;
  switch (state) {
  case 'searching':
    color = '#F8FAFC';
    lineWidth = 2;
    alpha = 0.2 + Math.sin(silhouette_pulse) * 0.15;
    break;
  case 'locked':
    color = '#22C55E';
    lineWidth = 3;
    alpha = 0.3;
    break;
  case 'out_of_bounds':
    color = '#EF4444';
    lineWidth = 2;
    alpha = 0.3 + Math.sin(silhouette_pulse * 2) * 0.15;
    break;
  default:
    color = '#F8FAFC';
    lineWidth = 2;
    alpha = 0.3;
  }

  canvas_ctx.save();
  if (state === 'out_of_bounds') {
    const shakeX = Math.sin(silhouette_pulse * 8) * 6;
    const shakeY = Math.cos(silhouette_pulse * 6) * 4;
    canvas_ctx.translate(shakeX, shakeY);
  }
  canvas_ctx.strokeStyle = color;
  canvas_ctx.lineWidth = lineWidth;
  canvas_ctx.setLineDash([6, 4]);
  canvas_ctx.globalAlpha = Math.max(0.1, Math.min(0.5, alpha));
  canvas_ctx.beginPath();
  canvas_ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  canvas_ctx.stroke();
  canvas_ctx.restore();

  silhouette_pulse += 0.04;
}

let checkmark_playing = false;

function drawCheckmark() {
  if (!checkmark_ctx || checkmark_playing) { return; }
  checkmark_playing = true;
  checkmarkCanvas.classList.remove('hidden');
  const w = checkmarkCanvas.width;
  const h = checkmarkCanvas.height;
  const cx = w / 2;
  const cy = h / 2;

  checkmark_ctx.clearRect(0, 0, w, h);
  checkmark_ctx.strokeStyle = '#22C55E';
  checkmark_ctx.lineWidth = 8;
  checkmark_ctx.lineCap = 'round';
  checkmark_ctx.lineJoin = 'round';

  let progress = 0;
  function frame() {
    progress += 0.03;
    if (progress >= 1) { progress = 1; }
    checkmark_ctx.clearRect(0, 0, w, h);
    checkmark_ctx.beginPath();
    checkmark_ctx.moveTo(cx - 30, cy);
    const midX = cx - 10;
    const midY = cy + 20;
    const endX = cx + 40;
    const endY = cy - 20;
    if (progress < 0.5) {
      const t = progress / 0.5;
      checkmark_ctx.lineTo(cx - 30 + (midX - (cx - 30)) * t, cy + (midY - cy) * t);
    } else {
      const t = (progress - 0.5) / 0.5;
      checkmark_ctx.lineTo(midX, midY);
      checkmark_ctx.lineTo(midX + (endX - midX) * t, midY + (endY - midY) * t);
    }
    checkmark_ctx.stroke();
    if (progress < 1) { requestAnimationFrame(frame); }
    else { checkmark_playing = false; }
  }
  requestAnimationFrame(frame);
}

function clearCheckmark() {
  checkmark_playing = false;
  checkmarkCanvas.classList.add('hidden');
  if (checkmark_ctx) {
    checkmark_ctx.clearRect(0, 0, checkmarkCanvas.width, checkmarkCanvas.height);
  }
}

function startCrosshair() {
  stopCrosshair();
  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;
  canvas_ctx = overlayCanvas.getContext('2d');
  let orbitAngle = 0;
  let arrowAmp = 0;
  let arrowDir = 1;
  let lastFrameTime = 0;
  const CROSSHAIR_FRAME_MS = 50;

  function loop(now) {
    if (gatekeeper.getState() === STATES.IDLE) { return; }
    if (now - lastFrameTime < CROSSHAIR_FRAME_MS) {
      crosshair_anim_id = requestAnimationFrame(loop);
      return;
    }
    lastFrameTime = now;
    canvas_ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    const state = gatekeeper.getState();
    let silState = 'searching';
    if (state === STATES.LAR_CHECK) { silState = 'searching'; }
    else if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) { silState = 'locked'; }
    else if (state === STATES.CAMERA_ACTIVE && fallback_sil_state === 'out_of_bounds') { silState = 'out_of_bounds'; }
    drawSilhouette(silState);

    drawCrosshair(state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE ? 0.5 : 0.2);

    if (state !== STATES.IDLE) {
      orbitAngle += 0.02;
      const w = overlayCanvas.width;
      const h = overlayCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.3;
      canvas_ctx.save();
      canvas_ctx.strokeStyle = 'rgba(13, 71, 161, 0.3)';
      canvas_ctx.lineWidth = 2;
      canvas_ctx.beginPath();
      canvas_ctx.arc(cx + Math.cos(orbitAngle) * radius, cy + Math.sin(orbitAngle) * radius, 6, 0, Math.PI * 2);
      canvas_ctx.stroke();
      canvas_ctx.restore();
    }

    if (show_arrow) {
      arrowAmp += arrowDir * 0.02;
      if (arrowAmp > 1 || arrowAmp < 0) { arrowDir *= -1; arrowAmp = Math.max(0, Math.min(1, arrowAmp)); }
      const w = overlayCanvas.width;
      const cx = w / 2;
      const h = overlayCanvas.height;
      canvas_ctx.save();
      const aColor = `rgba(239, 68, 68, ${0.3 + arrowAmp * 0.4})`;
      canvas_ctx.fillStyle = aColor;
      canvas_ctx.strokeStyle = aColor;
      canvas_ctx.lineWidth = 3;
      const arrowY = h * 0.15 + arrowAmp * 10;
      canvas_ctx.beginPath();
      canvas_ctx.moveTo(cx, arrowY + 20);
      canvas_ctx.lineTo(cx - 15, arrowY);
      canvas_ctx.lineTo(cx + 15, arrowY);
      canvas_ctx.closePath();
      canvas_ctx.fill();
      canvas_ctx.restore();
    }

    crosshair_anim_id = requestAnimationFrame(loop);
  }
  crosshair_anim_id = requestAnimationFrame(loop);
  lastFrameTime = performance.now();
}

function stopCrosshair() {
  if (crosshair_anim_id) { cancelAnimationFrame(crosshair_anim_id); crosshair_anim_id = null; }
  if (canvas_ctx) {
    canvas_ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    canvas_ctx = null;
  }
}

function startPitchPolling() {
  stopPitchPolling();
  stable_pitch_count = 0;
  pitch_poll_id = setInterval(function () {
    const cur = gatekeeper.getState();
    if (cur !== STATES.MIC_OPEN && cur !== STATES.SESSION_ACTIVE) { return; }
    const pitch = extractPitch();
    updatePitch(pitch);
    if (pitch > 0 && pitch <= f_max) {
      stable_pitch_count++;
      if (cur === STATES.MIC_OPEN && stable_pitch_count >= STABLE_PITCH_MIN) {
        gatekeeper.transitionTo(STATES.SESSION_ACTIVE, { mode: gatekeeper.getMode() });
      }
      setFlash('flash-success');
      if (cur !== STATES.SESSION_ACTIVE) { drawCheckmark(); }
    } else if (pitch > f_max) {
      stable_pitch_count = 0;
      if (cur === STATES.SESSION_ACTIVE) {
        gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: gatekeeper.getMode() });
      }
      setFlash('flash-warning');
    } else {
      stable_pitch_count = 0;
      if (cur === STATES.SESSION_ACTIVE) {
        gatekeeper.transitionTo(STATES.MIC_OPEN, { mode: gatekeeper.getMode() });
      }
      setFlash('flash-idle');
    }
  }, 100);
}

function stopPitchPolling() {
  if (pitch_poll_id) { clearInterval(pitch_poll_id); pitch_poll_id = null; }
}

async function openAudioGate() {
  if (audio_initialized || audio_initializing) { return; }
  audio_initializing = true;
  try {
    await initAudioStream();
    await calibrateAmbientNoise();
    audio_initialized = true;
  } catch (err) {
    console.warn('[Audio] Mic unavailable:', err.message);
    showError(true, 'Mic Error', 'Microphone access denied or unavailable.');
  } finally {
    audio_initializing = false;
  }
}

async function closeAudioGate() {
  audio_initialized = false;
  audio_initializing = false;
  await closeAudioStream();
}

gatekeeper.onEnter(STATES.CAMERA_ACTIVE, function () {
  showError(false);
  setFlash(null);
  startCrosshair();
  noFaceMsg.classList.remove('hidden');
  show_arrow = false;
});

gatekeeper.onEnter(STATES.LAR_CHECK, function () {
  out_of_threshold_since = 0;
  stable_pitch_count = 0;
});

gatekeeper.onEnter(STATES.MIC_OPEN, function () {
  openAudioGate();
  startPitchPolling();
});

gatekeeper.onExit(STATES.MIC_OPEN, function () {
  out_of_threshold_since = 0;
  closeAudioGate();
  stopPitchPolling();
  setFlash(null);
  clearCheckmark();
});

gatekeeper.onEnter(STATES.SESSION_ACTIVE, function () {
  showHaptic(true);
  drawCheckmark();
});

gatekeeper.onExit(STATES.SESSION_ACTIVE, function () {
  clearCheckmark();
});

gatekeeper.onEnter(STATES.IDLE, function () {
  out_of_threshold_since = 0;
  audio_initialized = false;
  audio_initializing = false;
  stopPitchPolling();
  setFlash(null);
  stopCrosshair();
  clearCheckmark();
});

let fallback_sil_state = 'searching';

function triggerFallback() {
  out_of_threshold_since = 0;
  gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE, { mode: null });
  setFlash('flash-error');
  fallback_sil_state = 'out_of_bounds';
  setTimeout(function () { fallback_sil_state = 'searching'; }, 600);
}

function onFaceLandmarks(landmarks) {
  if (gatekeeper.getState() === STATES.IDLE) { return; }
  const lar = computeLipAspectRatio(landmarks);
  updateLar(lar);
  const state = gatekeeper.getState();

  if (state === STATES.CAMERA_ACTIVE) {
    noFaceMsg.classList.add('hidden');
    show_arrow = false;
    if (face_paused) {
      face_paused = false;
      showError(true, 'Face Detected', 'Hold still. Resuming calibration...');
      setTimeout(function () { if (!face_paused) { showError(false); } }, 1200);
    }
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
      if (out_of_threshold_since === 0) { out_of_threshold_since = performance.now(); }
      if (performance.now() - out_of_threshold_since > LAR_DEBOUNCE_MS) {
        triggerFallback();
      }
    } else {
      out_of_threshold_since = 0;
    }
  }
}

function onNoFace() {
  if (gatekeeper.getState() === STATES.IDLE) { return; }
  const state = gatekeeper.getState();
  if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) {
    audio_initialized = false;
    audio_initializing = false;
    closeAudioStream();
    stopPitchPolling();
  }
  gatekeeper.fallbackTo(STATES.CAMERA_ACTIVE, { mode: null });
  setFlash('flash-idle');
  if (state === STATES.MIC_OPEN || state === STATES.SESSION_ACTIVE) {
    showError(true, 'Session Paused', 'Face lost. Please realign your face with the guide.');
    face_paused = true;
  } else {
    showError(true, 'Face Lost', 'Please position your face in the camera.');
  }
  noFaceMsg.classList.remove('hidden');
  show_arrow = true;
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
  if (gameCanvas) { gameCanvas.parentElement.classList.add('hidden'); }
  btnBack.classList.add('hidden');
  stopSession();
  stopVocaTone();
}

function resizeCanvases() {
  overlayCanvas.width = cameraFeed.clientWidth;
  overlayCanvas.height = cameraFeed.clientHeight;
  checkmarkCanvas.width = cameraFeed.clientWidth;
  checkmarkCanvas.height = cameraFeed.clientHeight;
}

async function startSession() {
  if (gatekeeper.getState() !== STATES.IDLE) { return; }
  stopCamera();
  audio_initialized = false;
  audio_initializing = false;
  out_of_threshold_since = 0;
  stable_pitch_count = 0;
  fallback_sil_state = 'searching';
  silhouette_pulse = 0;
  showError(false);
  face_paused = false;
  updateLar(0);
  updatePitch(0);
  setFlash(null);
  noFaceMsg.classList.add('hidden');
  resizeCanvases();
  checkmark_ctx = checkmarkCanvas.getContext('2d');
  resize_observer = new ResizeObserver(function () { resizeCanvases(); });
  resize_observer.observe(cameraFeed);

  const profile = await getProfile('default_user');
  if (!profile) {
    const def = await getDefaultProfile();
    await saveProfile(def);
  }

  try {
    camera_ctrl = initCamera({
      videoElement: cameraFeed,
      onFace: onFaceLandmarks,
      onNoFace: onNoFace,
    });
    await camera_ctrl.start();
    gatekeeper.transitionTo(STATES.CAMERA_ACTIVE);
    showHaptic(true);
  } catch (err) {
    showError(true, 'Camera Error', 'Could not access camera. Please check permissions.');
    showHaptic(false);
  }
}

async function stopSession() {
  if (gatekeeper.getState() === STATES.IDLE) { return; }
  stopPitchPolling();
  gatekeeper.reset();
  await closeAudioGate();
  stopCamera();
  camera_ctrl = null;
  updateLar(0);
  updatePitch(0);
  setFlash(null);
  stopCrosshair();
  show_arrow = false;
  fallback_sil_state = 'searching';
  stable_pitch_count = 0;
  clearCheckmark();
  showError(false);
  noFaceMsg.classList.add('hidden');
  checkmarkCanvas.classList.add('hidden');
  if (resize_observer) { resize_observer.disconnect(); resize_observer = null; }
}

function setCanvasFlash(type) {
  if (gameCanvas) {
    gameCanvas.classList.remove('flash-success', 'flash-warning', 'flash-error', 'flash-idle', 'flash-blink');
    if (type) {
      gameCanvas.classList.add(type);
      gameCanvas.classList.add('flash-blink');
    }
  }
}

function updateHUD() {
  if (!vocatone_game || !vocatone_game.running) { return; }
  const p = vocatone_game.pitch;
  updatePitch(p);
  if (p > 0) {
    if (p > f_max) {
      statusDisplay.textContent = 'Shrill';
      statusDisplay.className = 'text-lg font-bold text-warning';
      setCanvasFlash('flash-warning');
    } else {
      statusDisplay.textContent = 'Stable';
      statusDisplay.className = 'text-lg font-bold text-success';
      setCanvasFlash('flash-success');
    }
  } else {
    statusDisplay.textContent = 'Idle';
    statusDisplay.className = 'text-lg font-bold text-muted';
    setCanvasFlash('flash-error');
  }
}

async function startVocaTone() {
  if (vocatone_running || gatekeeper.getState() !== STATES.IDLE) { return; }
  showError(false);
  vocatone_running = true;
  btnStart.disabled = true;
  gameCanvas.width = gameCanvas.clientWidth;
  gameCanvas.height = gameCanvas.clientHeight;
  vocatone_game = new VocaTone(gameCanvas, {
    onError: function (title, msg) {
      vocatone_running = false;
      btnStart.disabled = false;
      showError(true, title, msg);
    },
    onFlash: function (type) {
      setCanvasFlash(type);
    },
  });
  await vocatone_game.start();
  if (vocatone_game.running) {
    statusDisplay.textContent = 'Listening';
    statusDisplay.className = 'text-lg font-bold text-primary';
  }
}

function stopVocaTone() {
  if (!vocatone_running && !vocatone_game) { return; }
  vocatone_running = false;
  btnStart.disabled = false;
  if (vocatone_game) { vocatone_game.stop(); vocatone_game = null; }
  updatePitch(0);
  statusDisplay.textContent = 'Idle';
  statusDisplay.className = 'text-lg font-bold text-muted';
  setCanvasFlash(null);
  showError(false);
}

function enterVocatoneView() {
  moduleSelect.classList.add('hidden');
  appHeader.classList.add('hidden');
  cameraView.classList.add('hidden');
  gameCanvas.parentElement.classList.remove('hidden');
  btnBack.classList.remove('hidden');
}

btnVocatone.addEventListener('click', function () {
  enterVocatoneView();
});

btnDualsense.addEventListener('click', function () {
  enterModuleView();
  startSession();
});

btnBack.addEventListener('click', function () {
  leaveModuleView();
});

btnStart.addEventListener('click', startVocaTone);
btnStop.addEventListener('click', stopVocaTone);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

if (performance.memory) {
  setInterval(function () {
    const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
    if (usedMB > 150) {
      console.warn('[Memory] Heap usage ' + usedMB + 'MB exceeds 150MB target.');
    }
  }, 30000);
}
