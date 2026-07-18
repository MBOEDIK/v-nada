import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VocaTone } from '../games/vocatone.js';

function makeMockCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 640;
  return canvas;
}

function mockContext(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect = vi.fn();
  ctx.fillRect = vi.fn();
  ctx.save = vi.fn();
  ctx.restore = vi.fn();
  ctx.beginPath = vi.fn();
  ctx.stroke = vi.fn();
  ctx.fill = vi.fn();
  ctx.ellipse = vi.fn();
  ctx.moveTo = vi.fn();
  ctx.lineTo = vi.fn();
  ctx.setLineDash = vi.fn();
  ctx.fillText = vi.fn();
  return ctx;
}

describe('VocaTone physics (update)', () => {
  let game;

  beforeEach(function () {
    vi.useFakeTimers();
    const canvas = makeMockCanvas();
    mockContext(canvas);
    game = new VocaTone(canvas, {
      onError: vi.fn(),
      onFlash: vi.fn(),
    });
    game.audio_ready = true;
    game.running = true;
  });

  it('start: balloon_y default 0.5, balloon_vy 0', () => {
    expect(game.balloon_y).toBe(0.5);
    expect(game.balloon_vy).toBe(0);
  });

  it('pitch > 0: balloon naik (vy = RISE_SPEED, balloon_y berkurang)', () => {
    game.pitch = 200;
    game.update();
    expect(game.balloon_vy).toBe(-0.004);
    expect(game.rising).toBe(true);
    expect(game.balloon_y).toBeLessThan(0.5);
  });

  it('pitch = 0: balloon turun (vy bertambah FALL_ACCEL per frame)', () => {
    game.pitch = 0;
    const vy0 = game.balloon_vy;
    game.update();
    expect(game.balloon_vy).toBe(vy0 + 0.0008);
    expect(game.rising).toBe(false);
    expect(game.balloon_y).toBeGreaterThan(0.5);
  });

  it('pitch = 0 berturut-turut: vy terus bertambah (akselerasi gravitasi)', () => {
    game.pitch = 0;
    game.update();
    const vy1 = game.balloon_vy;
    game.update();
    expect(game.balloon_vy).toBeGreaterThan(vy1);
  });

  it('balloon_y tidak kurang dari 0.05 (clamp batas atas)', () => {
    game.pitch = 200;
    for (let i = 0; i < 500; i++) {
      game.update();
    }
    expect(game.balloon_y).toBeGreaterThanOrEqual(0.05);
  });

  it('balloon_y tidak lebih dari 0.95 (clamp batas bawah)', () => {
    game.pitch = 0;
    for (let i = 0; i < 2000; i++) {
      game.update();
    }
    expect(game.balloon_y).toBeLessThanOrEqual(0.95);
  });

  it('pitch >= f_min (150) stabil > 1 detik di zona tengah: hover', () => {
    game.pitch = 200;
    const now = Date.now();
    vi.setSystemTime(now);
    game.stable_since = now;
    game.balloon_y = 0.5;

    vi.advanceTimersByTime(1000);
    game.update();
    expect(game.balloon_vy).toBe(0);
    expect(game.rising).toBe(false);
    expect(game.target_scale).toBe(1.0);
  });

  it('pitch > 0 tapi < f_min: tidak stabil (stable_since reset)', () => {
    game.pitch = 100;
    game.stable_since = Date.now();
    game.update();
    expect(game.stable_since).toBe(0);
  });

  it('target_scale naik ke 1.2 saat rising, kembali 1.0 saat tidak rising', () => {
    game.pitch = 200;
    game.update();
    expect(game.target_scale).toBe(1.2);

    game.pitch = 0;
    game.update();
    expect(game.target_scale).toBe(1.0);
  });
});

describe('VocaTone rendering (draw)', () => {
  let canvas;
  let ctx;
  let game;

  beforeEach(function () {
    canvas = makeMockCanvas();
    ctx = mockContext(canvas);
    game = new VocaTone(canvas, {
      onError: vi.fn(),
      onFlash: vi.fn(),
    });
    game.audio_ready = true;
    game.running = true;
  });

  it('drawBackground: fillStyle #f8fafc, fillRect full canvas', () => {
    game.drawBackground(ctx, 360, 640);
    expect(ctx.fillStyle).toBe('#f8fafc');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 360, 640);
  });

  it('drawSilhouette: draw ellipse dengan setLineDash [6,4]', () => {
    game.drawSilhouette(ctx, 360, 640);
    expect(ctx.strokeStyle).toBeDefined();
    expect(ctx.setLineDash).toHaveBeenCalledWith([6, 4]);
    expect(ctx.ellipse).toHaveBeenCalled();
  });

  it('drawBalloon: ellipse dipanggil dengan parameter proporsional', () => {
    game.balloon_y = 0.5;
    game.scale = 1;
    game.drawBalloon(ctx, 360, 640);
    expect(ctx.ellipse).toHaveBeenCalled();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draw: semua sub-render dipanggil (clearRect, ellipse, fillText)', () => {
    game.draw();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 360, 640);
    expect(ctx.ellipse).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
  });

  it('setFlash: panggil onFlash callback, clear setelah 600ms', () => {
    vi.useFakeTimers();
    const onFlash = vi.fn();
    game = new VocaTone(canvas, { onError: vi.fn(), onFlash: onFlash });

    game.setFlash('flash-success');
    expect(onFlash).toHaveBeenCalledWith('flash-success');
    expect(game.last_flash).toBe('flash-success');

    vi.advanceTimersByTime(600);
    expect(onFlash).toHaveBeenCalledWith(null);
    expect(game.last_flash).toBeNull();
    vi.useRealTimers();
  });
});

describe('VocaTone lifecycle', () => {
  it('constructor: properti default sesuai spec', () => {
    const canvas = makeMockCanvas();
    const game = new VocaTone(canvas, {
      onError: function () {},
      onFlash: function () {},
    });
    expect(canvas).toBeDefined();
    expect(game.balloon_y).toBe(0.5);
    expect(game.balloon_vy).toBe(0);
    expect(game.pitch).toBe(0);
    expect(game.running).toBe(false);
    expect(game.audio_ready).toBe(false);
    expect(game.scale).toBe(1);
    expect(game.target_scale).toBe(1);
  });

  it('stop: reset semua state ke default', () => {
    const canvas = makeMockCanvas();
    const game = new VocaTone(canvas, {
      onError: function () {},
      onFlash: function () {},
    });
    game.running = true;
    game.audio_ready = true;
    game.pitch = 200;
    game.balloon_y = 0.3;
    game.balloon_vy = -0.004;

    game.stop();

    expect(game.running).toBe(false);
    expect(game.audio_ready).toBe(false);
    expect(game.balloon_y).toBe(0.5);
    expect(game.balloon_vy).toBe(0);
    expect(game.pitch).toBe(0);
  });
});
