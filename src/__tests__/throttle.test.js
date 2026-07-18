import { describe, it, expect, vi, beforeEach } from 'vitest';

const FRAME_INTERVAL = 1000 / 20;

describe('throttleFrame', () => {
  beforeEach(function () {
    vi.resetModules();
  });

  it('sequential calls: pertama pass, kedua dalam interval fail', async () => {
    const { throttleFrame } = await import('../utils/vision.js');
    expect(throttleFrame(50)).toBe(true);
    expect(throttleFrame(50 + FRAME_INTERVAL - 1)).toBe(false);
  });

  it('dua call setelah interval: keduanya pass', async () => {
    const { throttleFrame } = await import('../utils/vision.js');
    expect(throttleFrame(100)).toBe(true);
    expect(throttleFrame(100 + FRAME_INTERVAL + 1)).toBe(true);
  });

  it('loop: hanya setiap FRAME_INTERVAL yang lolos', async () => {
    const { throttleFrame } = await import('../utils/vision.js');
    const results = [];
    for (let t = 0; t <= 200; t += 10) {
      results.push(throttleFrame(t));
    }
    const passed = results.filter(function (v) { return v; }).length;
    expect(passed).toBeGreaterThan(0);
    expect(passed).toBeLessThan(results.length);
  });
});

describe('throttleFrame with real timestamps', () => {
  it('throttles at ~20 FPS with performance.now()', async () => {
    vi.resetModules();
    const { throttleFrame } = await import('../utils/vision.js');
    const now = performance.now();
    expect(throttleFrame(now + 50)).toBe(true);
    expect(throttleFrame(now + 80)).toBe(false);
    expect(throttleFrame(now + 150)).toBe(true);
  });
});
