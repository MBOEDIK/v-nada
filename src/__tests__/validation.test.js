import { describe, it, expect, beforeEach } from 'vitest';
import { GateKeeper, STATES } from '../utils/gatekeeper.js';
import { lar_threshold } from '../utils/constants.js';

describe('LAR Threshold default', () => {
  it('high = 0.5 (mulut menganga → A)', () => {
    expect(lar_threshold.high).toBe(0.5);
  });

  it('low = 0.2 (bibir melebar → I)', () => {
    expect(lar_threshold.low).toBe(0.2);
  });
});

describe('GateKeeper + LAR Validation (integrasi)', () => {
  let gate;

  beforeEach(function () {
    gate = new GateKeeper();
  });

  it('LAR ≥ 0.5 → transisi ke MIC_OPEN mode A', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);

    const lar = 0.6;
    if (lar >= gate.threshold.high) {
      gate.transitionTo(STATES.MIC_OPEN, { mode: 'A' });
    }

    expect(gate.getState()).toBe(STATES.MIC_OPEN);
    expect(gate.getMode()).toBe('A');
  });

  it('LAR ≤ 0.2 → transisi ke MIC_OPEN mode I', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);

    const lar = 0.15;
    if (lar <= gate.threshold.low) {
      gate.transitionTo(STATES.MIC_OPEN, { mode: 'I' });
    }

    expect(gate.getState()).toBe(STATES.MIC_OPEN);
    expect(gate.getMode()).toBe('I');
  });

  it('LAR di antara threshold → tetap di LAR_CHECK', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);

    const lar = 0.35;
    if (lar >= gate.threshold.high) {
      gate.transitionTo(STATES.MIC_OPEN, { mode: 'A' });
    } else if (lar <= gate.threshold.low) {
      gate.transitionTo(STATES.MIC_OPEN, { mode: 'I' });
    }

    expect(gate.getState()).toBe(STATES.LAR_CHECK);
    expect(gate.getMode()).toBeNull();
  });
});

describe('Instant Fallback (C9)', () => {
  let gate;

  beforeEach(function () {
    gate = new GateKeeper();
  });

  it('mode A: LAR turun di bawah high → fallback trigger', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);
    gate.transitionTo(STATES.MIC_OPEN, { mode: 'A' });

    const currentMode = gate.getMode();
    const lar = 0.3;
    const threshold = currentMode === 'A' ? gate.threshold.high : gate.threshold.low;
    const shouldFallback = currentMode === 'A' ? lar < threshold : lar > threshold;

    if (shouldFallback) {
      gate.fallbackTo(STATES.IDLE);
    }

    expect(shouldFallback).toBe(true);
    expect(gate.getState()).toBe(STATES.IDLE);
  });

  it('mode I: LAR naik di atas low → fallback trigger', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);
    gate.transitionTo(STATES.MIC_OPEN, { mode: 'I' });

    const currentMode = gate.getMode();
    const lar = 0.35;
    const threshold = currentMode === 'A' ? gate.threshold.high : gate.threshold.low;
    const shouldFallback = currentMode === 'A' ? lar < threshold : lar > threshold;

    if (shouldFallback) {
      gate.fallbackTo(STATES.IDLE);
    }

    expect(shouldFallback).toBe(true);
    expect(gate.getState()).toBe(STATES.IDLE);
  });

  it('mode A: LAR tetap ≥ high → tidak fallback', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);
    gate.transitionTo(STATES.MIC_OPEN, { mode: 'A' });

    const lar = 0.6;
    const shouldFallback = lar < gate.threshold.high;

    expect(shouldFallback).toBe(false);
    expect(gate.getState()).toBe(STATES.MIC_OPEN);
  });

  it('mode I: LAR tetap ≤ low → tidak fallback', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);
    gate.transitionTo(STATES.MIC_OPEN, { mode: 'I' });

    const lar = 0.1;
    const shouldFallback = lar > gate.threshold.low;

    expect(shouldFallback).toBe(false);
    expect(gate.getState()).toBe(STATES.MIC_OPEN);
  });

  it('fallback reset state machine ke IDLE', () => {
    gate.transitionTo(STATES.CAMERA_ACTIVE);
    gate.transitionTo(STATES.LAR_CHECK);
    gate.transitionTo(STATES.MIC_OPEN, { mode: 'A' });

    gate.fallbackTo(STATES.IDLE);

    expect(gate.getState()).toBe(STATES.IDLE);
    expect(gate.getMode()).toBeNull();
  });
});
