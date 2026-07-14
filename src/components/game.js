/**
 * game.js — VocaTone Single-Game Placeholder (GAME-01)
 *
 * Canvas2D game loop with throttled physics for the VocaTone
 * audio-only training module.  A placeholder rectangle's Y-position
 * is driven by microphone pitch input from the Web Audio API pipeline.
 *
 * Motion phases:
 *   Rise  — pitch > 0: constant upward velocity
 *   Hover — pitch stable in [fMin, fMax] ≥ 500 ms: sinusoidal drift
 *   Fall  — pitch null/0: gravity acceleration
 *
 * Performance contract:
 *   - 20 FPS cap via 50 ms time-debounce (TECH-04)
 *   - Zero heap allocation inside the game loop (pre-allocated state)
 *   - cancelAnimationFrame + null pointer cleanup on stop
 */

// ── Constants ───────────────────────────────────────────────────────

/** Placeholder object width (px). */
const OBJ_W = 40;

/** Placeholder object height (px). */
const OBJ_H = 40;

/** Rise speed — px per frame upward (negative Y). */
const RISE_SPEED = 2;

/** Gravity acceleration — px per frame² downward. */
const GRAVITY = 1.5;

/** Terminal fall velocity — px per frame cap. */
const MAX_FALL_SPEED = 8;

/** Duration (ms) pitch must stay in target range to trigger hover. */
const STABLE_DURATION_MS = 500;

/** Allowed ±fraction deviation from target frequency boundaries (0.1 = ±10%). */
const FREQ_TOLERANCE = 0.1;

/** Minimum inter-frame interval (ms) → 20 FPS cap. */
const FRAME_INTERVAL_MS = 50;

/** Default target frequency range (Hz). */
const DEFAULT_F_MIN = 150;
const DEFAULT_F_MAX = 350;

/** Canvas background fill colour. */
const BG_COLOR = '#F8FAFC';

/** Object fill colour (primary token). */
const OBJ_FILL = '#0D47A1';

/** Object stroke colour. */
const OBJ_STROKE = '#FFFFFF';

// ── Class ───────────────────────────────────────────────────────────

class VocaToneGame {
  /**
   * @param {HTMLCanvasElement} canvasElement - The <canvas> to render into
   */
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    /** Callback that returns the current pitch in Hz (or null/0). */
    this._pitchProvider = null;

    // ── Pre-allocated per-frame state (zero GC in loop) ──────────
    this.positionY = 0;
    this.velocityY = 0;
    this.fallTimer = 0;
    this.stabilityTimer = 0;
    this.currentPitchHz = 0;

    // ── Loop control ─────────────────────────────────────────────
    this.rafId = null;
    this.lastFrameTime = 0;
    this.running = false;

    // ── Target frequency range (overridable) ─────────────────────
    this.fMin = DEFAULT_F_MIN;
    this.fMax = DEFAULT_F_MAX;

    // ── Dynamic resize observer ──────────────────────────────────
    this._resizeObserver = null;
    this._initResize();
  }

  // ── Dynamic Resize ──────────────────────────────────────────────

  _initResize() {
    const parent = this.canvas.parentElement;
    if (!parent) {
      return;
    }
    this._resizeObserver = new ResizeObserver(() => this._syncSize());
    this._resizeObserver.observe(parent);
    this._syncSize();
  }

  _syncSize() {
    const parent = this.canvas.parentElement;
    if (!parent) {
      return;
    }
    const rect = parent.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  // ── Game Loop (20 FPS throttle) ─────────────────────────────────

  /**
   * Start the game loop.
   *
   * @param {Function} pitchProvider - Called each frame; returns Hz or null
   */
  startLoop(pitchProvider) {
    if (this.running) {
      return;
    }

    this._pitchProvider = pitchProvider || null;
    this.running = true;
    this.lastFrameTime = 0;

    // Reset physics state — object starts at the bottom edge
    this.positionY = this.canvas.height - OBJ_H;
    this.velocityY = 0;
    this.fallTimer = 0;
    this.stabilityTimer = 0;

    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  /**
   * Stop the loop, release the animation handle, and null references.
   */
  stopLoop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTime = 0;
    this._pitchProvider = null;
  }

  /**
   * Core loop — throttled to ~20 FPS via time-debounce.
   *
   * Throttle formula:
   *   elapsed = timestamp - lastFrameTime
   *   if elapsed < 50 ms → skip this frame (schedule next RAF, return)
   *   else → process physics + render, update lastFrameTime
   *
   * All computation is confined to pre-allocated instance fields.
   * No new objects, closures, or allocations are created per frame.
   */
  _loop(timestamp) {
    if (!this.running) {
      return;
    }

    // ── 50 ms time-debounce (20 FPS cap) ──────────────────────────
    if (timestamp - this.lastFrameTime < FRAME_INTERVAL_MS) {
      this.rafId = requestAnimationFrame((t) => this._loop(t));
      return;
    }

    this.lastFrameTime = timestamp;

    // Sample pitch from provider (reuses pre-allocated currentPitchHz)
    this.currentPitchHz = this._pitchProvider ? this._pitchProvider() : 0;

    // Physics → Render → Schedule next frame
    this._updatePhysics(this.currentPitchHz);
    this._render();

    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  // ── Physics Engine (3-Phase State Machine) ──────────────────────

  /**
   * Update positionY based on the current pitch input.
   *
   * Phase logic:
   *   pitch > 0  → RISE:  velocityY = -RISE_SPEED (constant upward)
   *   pitch = 0  → FALL:  velocityY = min(GRAVITY × fallTimer, MAX_FALL_SPEED)
   *   stable ≥ 500 ms → HOVER: velocityY = 0, sinusoidal Y drift
   *
   * Stability is accumulated via frame-count (+50 ms per frame),
   * avoiding any Date/time object allocation inside the hot loop.
   *
   * @param {number|null} pitchHz - Current pitch in Hz or null/0
   */
  _updatePhysics(pitchHz) {
    // ── Effective tolerance bounds (±10% on target range) ────────
    // Widens the acceptance window so micro-fluctuations don't
    // reset the stability timer on every frame.
    const tolerance_min = this.fMin * (1 - FREQ_TOLERANCE);
    const tolerance_max = this.fMax * (1 + FREQ_TOLERANCE);

    if (pitchHz > 0) {
      // ── RISE phase ──────────────────────────────────────────────
      this.velocityY = -RISE_SPEED;
      this.fallTimer = 0;

      // Accumulate stability only when pitch is within tolerance bounds.
      // Each valid frame adds FRAME_INTERVAL_MS (50 ms) to the counter.
      if (pitchHz >= tolerance_min && pitchHz <= tolerance_max) {
        this.stabilityTimer += FRAME_INTERVAL_MS;
      } else {
        this.stabilityTimer = 0;
      }
    } else {
      // ── FALL phase (gravity acceleration) ───────────────────────
      // fallTimer counts frames since sound was lost.
      // velocityY = GRAVITY × fallTimer, capped at MAX_FALL_SPEED.
      this.stabilityTimer = 0;
      this.fallTimer++;
      this.velocityY = Math.min(this.fallTimer * GRAVITY, MAX_FALL_SPEED);
    }

    // ── HOVER phase — sinusoidal drift when pitch stable in range ─
    const isHovering = this.stabilityTimer >= STABLE_DURATION_MS && pitchHz > 0;
    if (isHovering) {
      this.velocityY = 0;
      // Cosmetic micro-vibration via absolute time sine (zero allocation)
      const t = performance.now() * 0.002;
      this.positionY += Math.sin(t) * 0.5;
    } else {
      this.positionY += this.velocityY;
    }

    // ── Strict viewport clamp: 0 ≤ positionY ≤ height − OBJ_H ───
    const maxY = this.canvas.height - OBJ_H;
    this.positionY = Math.max(0, Math.min(this.positionY, maxY));
  }

  // ── Render Pipeline ─────────────────────────────────────────────

  /**
   * Clear canvas, fill background, draw placeholder object.
   * Called once per frame after physics update.
   */
  _render() {
    const { ctx, canvas } = this;

    // Clear + solid background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Placeholder rectangle — centred horizontally
    const x = (canvas.width - OBJ_W) * 0.5;
    ctx.fillStyle = OBJ_FILL;
    ctx.fillRect(x, this.positionY, OBJ_W, OBJ_H);
    ctx.strokeStyle = OBJ_STROKE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, this.positionY, OBJ_W, OBJ_H);
  }

  // ── Public API ──────────────────────────────────────────────────

  setTargetRange(fMin, fMax) {
    this.fMin = fMin;
    this.fMax = fMax;
  }

  /**
   * Full teardown: stop loop + disconnect resize observer.
   */
  destroy() {
    this.stopLoop();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
}

export default VocaToneGame;
