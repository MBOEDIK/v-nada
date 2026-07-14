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

/** Canvas background — default / rise / fall. */
const BG_DEFAULT = '#F8FAFC';

/** Canvas background — stable hover (green, 20 % opacity). */
const BG_STABLE = 'rgba(34, 197, 94, 0.2)';

/** Canvas background — shrill / overpitch (yellow, 20 % opacity). */
const BG_SHRILL = 'rgba(234, 179, 8, 0.2)';

/** Object fill colour (primary token). */
const OBJ_FILL = '#0D47A1';

/** Object stroke colour. */
const OBJ_STROKE = '#FFFFFF';

/** HUD text colour (dark on light). */
const HUD_TEXT = '#333333';

/** HUD font — bold 16 px for pitch value (cached, zero alloc in loop). */
const HUD_FONT_PITCH = 'bold 16px Inter, sans-serif';

/** HUD font — 13 px for labels. */
const HUD_FONT_LABEL = '13px Inter, sans-serif';

/** HUD font — bold 14 px for status. */
const HUD_FONT_STATUS = 'bold 14px Inter, sans-serif';

/** Status labels — pre-allocated, zero alloc in render loop. */
const STATUS_LABELS = { rise: 'Naik', stable: 'Stabil', fall: 'Turun', shrill: 'Naik' };

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
   * Determine the current visual state from physics fields.
   *
   * Priority: shrill > stable > rise > fall.
   *   shrill  — pitch > fMax (overpitch warning)
   *   stable  — pitch in range + stabilityTimer ≥ STABLE_DURATION_MS
   *   rise    — pitch > 0 (not yet stable, not shrill)
   *   fall    — pitch null/0
   *
   * @returns {'fall'|'rise'|'stable'|'shrill'}
   */
  _getGameState() {
    const pitch = this.currentPitchHz;

    if (pitch <= 0) {
      return 'fall';
    }
    if (pitch > this.fMax) {
      return 'shrill';
    }
    if (this.stabilityTimer >= STABLE_DURATION_MS) {
      return 'stable';
    }
    return 'rise';
  }

  /**
   * Fill canvas background based on the current game state.
   *   fall / rise → default light grey
   *   stable     → green tint 20 %
   *   shrill     → yellow tint 20 %
   */
  _drawBackground() {
    const { ctx, canvas } = this;
    const state = this._getGameState();

    if (state === 'stable') {
      ctx.fillStyle = BG_STABLE;
    } else if (state === 'shrill') {
      ctx.fillStyle = BG_SHRILL;
    } else {
      ctx.fillStyle = BG_DEFAULT;
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Draw the player placeholder object (40 × 40 px box).
   * Centred horizontally, Y controlled by physics.
   */
  _drawObject() {
    const { ctx, canvas } = this;
    const x = (canvas.width - OBJ_W) * 0.5;

    ctx.fillStyle = OBJ_FILL;
    ctx.fillRect(x, this.positionY, OBJ_W, OBJ_H);
    ctx.strokeStyle = OBJ_STROKE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, this.positionY, OBJ_W, OBJ_H);
  }

  /**
   * Overlay HUD — pitch value, status label, and stability progress bar.
   *
   * Layout:
   *   Top-left     → pitch Hz (e.g. "245 Hz" or "--")
   *   Top-right    → status label ("Naik" / "Stabil" / "Turun")
   *   Bottom-right → stability progress bar (ratio / STABLE_DURATION_MS)
   *
   * All font strings are pre-cached as module constants — zero allocation.
   */
  _drawHUD() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const pitch = this.currentPitchHz;
    const state = this._getGameState();

    // ── Top-left: Pitch value ─────────────────────────────────────
    ctx.font = HUD_FONT_PITCH;
    ctx.fillStyle = HUD_TEXT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      (pitch > 0) ? `${Math.round(pitch)} Hz` : '--',
      12,
      12,
    );

    // ── Top-right: Status label ───────────────────────────────────
    ctx.font = HUD_FONT_STATUS;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(STATUS_LABELS[state], w - 12, 12);

    // ── Bottom-right: Stability progress bar ──────────────────────
    const bar_w = 60;
    const bar_h = 8;
    const bar_x = w - 12 - bar_w;
    const bar_y = h - 12 - bar_h;
    const ratio = Math.min(this.stabilityTimer / STABLE_DURATION_MS, 1);

    // Background track
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(bar_x, bar_y, bar_w, bar_h);

    // Fill (green when progress > 0)
    if (ratio > 0) {
      ctx.fillStyle = OBJ_FILL;
      ctx.fillRect(bar_x, bar_y, bar_w * ratio, bar_h);
    }

    // Label above bar
    ctx.font = HUD_FONT_LABEL;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Stability', bar_x + bar_w, bar_y - 2);
  }

  /**
   * Master render — called once per frame after updatePhysics().
   *
   * Pipeline: clear → background → object → HUD.
   * Guard: skips HUD if game loop is not running (prevents render
   * garbage during initialisation before startLoop() is called).
   */
  _render() {
    const { ctx, canvas } = this;

    // Clear entire surface (prevents ghost frames)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this._drawBackground();
    this._drawObject();

    if (this.running) {
      this._drawHUD();
    }
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
