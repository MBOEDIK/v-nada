import { describe, it, expect } from 'vitest';
import { lar_threshold, f_min, f_max } from '../utils/constants.js';

describe('constants', () => {
  it('lar_threshold.high default 0.5', () => {
    expect(lar_threshold.high).toBe(0.5);
  });

  it('lar_threshold.low default 0.2', () => {
    expect(lar_threshold.low).toBe(0.2);
  });

  it('f_min default 150', () => {
    expect(f_min).toBe(150);
  });

  it('f_max default 350', () => {
    expect(f_max).toBe(350);
  });
});
