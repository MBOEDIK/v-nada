import './styles/main.css';
import { VocaTone } from './games/vocatone.js';

const $ = function (id) { return document.getElementById(id); };

const gameCanvas = $('game-canvas');
const pitchDisplay = $('pitch-display');
const statusDisplay = $('status-display');
const accuracyDisplay = $('accuracy-display');
const starDisplay = $('star-display');
const errorScreen = $('error-screen');
const btnStart = $('btn-start');
const btnStop = $('btn-stop');

let game = null;
let gameRunning = false;

function updatePitch(value) { pitchDisplay.textContent = value > 0 ? `${Math.round(value)} Hz` : '--'; }
function updateStatus(text, color) {
  statusDisplay.textContent = text;
  statusDisplay.className = 'text-lg font-bold ' + (color || 'text-muted');
}
function updateAccuracy(value) { accuracyDisplay.textContent = `${Math.round(value * 100)}%`; }
function updateStars(count) {
  const filled = '\u2605'.repeat(count);
  const empty = '\u2606'.repeat(3 - count);
  starDisplay.textContent = filled + empty;
}

function showError(show, title, msg) {
  if (!show) { errorScreen.classList.add('hidden'); return; }
  errorScreen.classList.remove('hidden');
  if (title) { errorScreen.querySelector('h2').textContent = title; }
  if (msg) { errorScreen.querySelector('p').textContent = msg; }
}

function setCanvasFlash(type) {
  gameCanvas.classList.remove('flash-success', 'flash-warning', 'flash-error', 'flash-idle');
  if (type) { gameCanvas.classList.add(type); }
}

function updateHUD() {
  if (!game || !game.running) { return; }
  updatePitch(game.pitch);
  if (game.pitch > 0) {
    if (game.pitch > 350) {
      updateStatus('Shrill', 'text-warning');
      setCanvasFlash('flash-warning');
    } else if (game.pitch >= 150) {
      updateStatus('Stable', 'text-success');
      setCanvasFlash('flash-success');
    } else {
      updateStatus('Low', 'text-muted');
      setCanvasFlash('flash-idle');
    }
  } else {
    updateStatus('Idle', 'text-muted');
    setCanvasFlash(null);
  }
}

async function startGame() {
  if (gameRunning) { return; }
  showError(false);
  gameRunning = true;
  btnStart.disabled = true;

  gameCanvas.width = gameCanvas.clientWidth;
  gameCanvas.height = gameCanvas.clientHeight;

  game = new VocaTone(gameCanvas, {
    onError: function (title, msg) {
      gameRunning = false;
      btnStart.disabled = false;
      showError(true, title, msg);
    },
    onFlash: function (type) {
      setCanvasFlash(type);
    },
  });

  await game.start();
  if (game.running) {
    updateStatus('Listening', 'text-primary');
    updateAccuracy(0);
    updateStars(0);
  }
}

function stopGame() {
  if (!gameRunning && !game) { return; }
  gameRunning = false;
  btnStart.disabled = false;
  if (game) { game.stop(); game = null; }
  updatePitch(0);
  updateStatus('Idle', 'text-muted');
  updateAccuracy(0);
  updateStars(0);
  setCanvasFlash(null);
  showError(false);
}

btnStart.addEventListener('click', startGame);
btnStop.addEventListener('click', stopGame);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

setInterval(updateHUD, 100);
