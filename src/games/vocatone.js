import { extractPitch, initAudioStream, closeAudioStream, calibrateAmbientNoise } from '../utils/audio.js';
import { lar_threshold, f_min } from '../utils/constants.js';

const FALL_ACCEL = 0.0008;
const RISE_SPEED = -0.004;
const BG_COLOR = '#F8FAFC';
const BALLOON_COLOR = '#60A5FA';
const BALLOON_ALT_COLOR = '#93C5FD';
const STABILITY_MS = 1000;
const UPDATE_INTERVAL = 33;

export class VocaTone {
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onError = opts.onError || function () {};
    this.onFlash = opts.onFlash || function () {};

    this.balloonY = 0.5;
    this.balloonVy = 0;
    this.pitch = 0;
    this.rms = 0;
    this.running = false;
    this.audioReady = false;
    this.scale = 1;
    this.targetScale = 1;
    this.stableSince = 0;
    this.rising = false;
    this.flashTimer = null;
    this.lastFlash = null;
    this.updateId = null;
  }

  async start() {
    try {
      await initAudioStream();
      await calibrateAmbientNoise();
      this.audioReady = true;
    } catch (err) {
      this.onError('Mic Error', 'Microphone access denied or unavailable. Please check permissions.');
      return;
    }
    this.running = true;
    this.loop();
    this.startPolling();
  }

  stop() {
    this.running = false;
    this.audioReady = false;
    closeAudioStream();
    this.balloonY = 0.5;
    this.balloonVy = 0;
    this.pitch = 0;
    this.rms = 0;
    this.scale = 1;
    this.targetScale = 1;
    this.stableSince = 0;
    this.rising = false;
    this.clearFlash();
    if (this.updateId) { clearInterval(this.updateId); this.updateId = null; }
  }

  startPolling() {
    if (this.updateId) { clearInterval(this.updateId); }
    this.updateId = setInterval(function () {
      if (!this.running || !this.audioReady) { return; }
      this.pitch = extractPitch();
    }.bind(this), UPDATE_INTERVAL);
  }

  loop() {
    if (!this.running) { return; }
    this.update();
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  update() {
    const w = this.canvas.width;
    const dh = this.canvas.height;

    this.scale += (this.targetScale - this.scale) * 0.1;

    if (this.pitch > 0) {
      this.balloonVy = RISE_SPEED;
      this.rising = true;
      this.targetScale = 1.2;

      if (this.pitch >= f_min) {
        if (this.stableSince === 0) { this.stableSince = Date.now(); }
        if (Date.now() - this.stableSince >= STABILITY_MS && this.balloonY > 0.25 && this.balloonY < 0.75) {
          this.balloonVy = 0;
          this.rising = false;
          this.targetScale = 1.0;
        }
      } else {
        this.stableSince = 0;
      }
    } else {
      this.balloonVy += FALL_ACCEL;
      this.rising = false;
      this.targetScale = 1.0;
      this.stableSince = 0;
    }

    this.balloonY += this.balloonVy;
    this.balloonY = Math.max(0.05, Math.min(0.95, this.balloonY));
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!w || !h) { return; }

    ctx.clearRect(0, 0, w, h);

    this.drawBackground(ctx, w, h);
    this.drawSilhouette(ctx, w, h);
    this.drawBalloon(ctx, w, h);
    this.drawVowel(ctx, w, h);
  }

  drawBackground(ctx, w, h) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);
  }

  drawSilhouette(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.25, h * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawBalloon(ctx, w, h) {
    const cx = w / 2;
    const by = this.balloonY * h;
    const baseR = Math.min(w, h) * 0.08;
    const r = baseR * this.scale;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;

    const grad = ctx.createRadialGradient(cx - r * 0.3, by - r * 0.3, r * 0.1, cx, by, r);
    grad.addColorStop(0, BALLOON_ALT_COLOR);
    grad.addColorStop(1, BALLOON_COLOR);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, by, r, r * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.2, by + r * 1.1);
    ctx.lineTo(cx - r * 0.05, by + r * 1.6);
    ctx.moveTo(cx + r * 0.2, by + r * 1.1);
    ctx.lineTo(cx + r * 0.05, by + r * 1.6);
    ctx.stroke();

    ctx.restore();
  }

  drawVowel(ctx, w, h) {
    ctx.save();
    ctx.font = 'bold 72pt Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000000';
    ctx.fillText('A', w / 2, 16);
    ctx.restore();
  }

  setFlash(type) {
    this.clearFlash();
    this.lastFlash = type;
    this.onFlash(type);
    this.flashTimer = setTimeout(function () {
      this.clearFlash();
    }.bind(this), 600);
  }

  clearFlash() {
    if (this.flashTimer) { clearTimeout(this.flashTimer); this.flashTimer = null; }
    if (this.lastFlash) { this.onFlash(null); this.lastFlash = null; }
  }
}
