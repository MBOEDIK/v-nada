import { describe, it, expect } from 'vitest';
import { computeEuclideanDistance, computeLipAspectRatio, FACEMESH_LIPS } from '../utils/vision.js';

describe('FACEMESH_LIPS', () => {
  it('memiliki indeks yang benar', () => {
    expect(FACEMESH_LIPS.top).toBe(13);
    expect(FACEMESH_LIPS.bottom).toBe(14);
    expect(FACEMESH_LIPS.left).toBe(78);
    expect(FACEMESH_LIPS.right).toBe(308);
  });
});

describe('computeEuclideanDistance', () => {
  it('triple Pythagoras 3-4-5: (0,0) ke (3,4) = 5', () => {
    const d = computeEuclideanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(d).toBeCloseTo(5, 10);
  });

  it('titik identik: (1,1) ke (1,1) = 0', () => {
    const d = computeEuclideanDistance({ x: 1, y: 1 }, { x: 1, y: 1 });
    expect(d).toBe(0);
  });

  it('jarak antar sumbu x saja: (0,5) ke (10,5) = 10', () => {
    const d = computeEuclideanDistance({ x: 0, y: 5 }, { x: 10, y: 5 });
    expect(d).toBeCloseTo(10, 10);
  });

  it('deterministik: input sama menghasilkan output sama', () => {
    const a = { x: 2, y: 3 };
    const b = { x: 5, y: 7 };
    const r1 = computeEuclideanDistance(a, b);
    const r2 = computeEuclideanDistance(a, b);
    expect(r1).toBe(r2);
  });
});

function createLandmark(x, y, z = 0) {
  return { x, y, z };
}

function makeMockLandmarks(top, bottom, left, right) {
  const lm = new Array(468).fill(null).map(function () { return createLandmark(0, 0); });
  lm[FACEMESH_LIPS.top] = top;
  lm[FACEMESH_LIPS.bottom] = bottom;
  lm[FACEMESH_LIPS.left] = left;
  lm[FACEMESH_LIPS.right] = right;
  return lm;
}

describe('computeLipAspectRatio', () => {
  it('mulut terbuka lebar: LAR > 0.5', () => {
    const lm = makeMockLandmarks(
      createLandmark(0.5, 0.3),
      createLandmark(0.5, 0.7),
      createLandmark(0.3, 0.5),
      createLandmark(0.7, 0.5),
    );
    const lar = computeLipAspectRatio(lm);
    expect(lar).toBeGreaterThan(0.5);
  });

  it('mulut tertutup/meringis: LAR < 0.2', () => {
    const lm = makeMockLandmarks(
      createLandmark(0.5, 0.48),
      createLandmark(0.5, 0.52),
      createLandmark(0.3, 0.5),
      createLandmark(0.7, 0.5),
    );
    const lar = computeLipAspectRatio(lm);
    expect(lar).toBeLessThan(0.2);
  });

  it('division by zero: horizontal=0 return 0', () => {
    const lm = makeMockLandmarks(
      createLandmark(0.5, 0.3),
      createLandmark(0.5, 0.7),
      createLandmark(0.5, 0.5),
      createLandmark(0.5, 0.5),
    );
    const lar = computeLipAspectRatio(lm);
    expect(lar).toBe(0);
  });

  it('pure function: output hanya bergantung pada input', () => {
    const lm = makeMockLandmarks(
      createLandmark(0.5, 0.3),
      createLandmark(0.5, 0.7),
      createLandmark(0.3, 0.5),
      createLandmark(0.7, 0.5),
    );
    const r1 = computeLipAspectRatio(lm);
    const r2 = computeLipAspectRatio(lm);
    expect(r1).toBe(r2);
  });
});
