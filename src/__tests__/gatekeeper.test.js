import { describe, it, expect, beforeEach } from 'vitest';
import { GateKeeper, STATES } from '../utils/gatekeeper.js';

describe('GateKeeper', () => {
  let gate;

  beforeEach(function () {
    gate = new GateKeeper();
  });

  describe('initial state', () => {
    it('state awal IDLE', () => {
      expect(gate.getState()).toBe(STATES.IDLE);
    });

    it('mode awal null', () => {
      expect(gate.getMode()).toBeNull();
    });
  });

  describe('valid transitions', () => {
    it('IDLE -> CAMERA_ACTIVE', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      expect(gate.getState()).toBe(STATES.CAMERA_ACTIVE);
    });

    it('CAMERA_ACTIVE -> LAR_CHECK', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      expect(gate.getState()).toBe(STATES.LAR_CHECK);
    });

    it('LAR_CHECK -> MIC_OPEN dengan mode A', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      gate.transitionTo(STATES.MIC_OPEN, { mode: 'A' });
      expect(gate.getState()).toBe(STATES.MIC_OPEN);
      expect(gate.getMode()).toBe('A');
    });

    it('LAR_CHECK -> MIC_OPEN dengan mode I', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      gate.transitionTo(STATES.MIC_OPEN, { mode: 'I' });
      expect(gate.getState()).toBe(STATES.MIC_OPEN);
      expect(gate.getMode()).toBe('I');
    });

    it('MIC_OPEN -> SESSION_ACTIVE', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      gate.transitionTo(STATES.MIC_OPEN);
      gate.transitionTo(STATES.SESSION_ACTIVE);
      expect(gate.getState()).toBe(STATES.SESSION_ACTIVE);
    });

    it('full pipeline: IDLE -> CAMERA_ACTIVE -> LAR_CHECK -> MIC_OPEN -> SESSION_ACTIVE', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      gate.transitionTo(STATES.MIC_OPEN);
      gate.transitionTo(STATES.SESSION_ACTIVE);
      expect(gate.getState()).toBe(STATES.SESSION_ACTIVE);
    });
  });

  describe('invalid transitions', () => {
    it('IDLE -> MIC_OPEN throw error', () => {
      expect(function () { gate.transitionTo(STATES.MIC_OPEN); }).toThrow();
    });

    it('IDLE -> SESSION_ACTIVE throw error', () => {
      expect(function () { gate.transitionTo(STATES.SESSION_ACTIVE); }).toThrow();
    });

    it('CAMERA_ACTIVE -> SESSION_ACTIVE throw error', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      expect(function () { gate.transitionTo(STATES.SESSION_ACTIVE); }).toThrow();
    });

    it('LAR_CHECK -> IDLE valid (tidak throw)', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      expect(function () { gate.transitionTo(STATES.IDLE); }).not.toThrow();
    });
  });

  describe('reset()', () => {
    it('reset dari CAMERA_ACTIVE ke IDLE', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.reset();
      expect(gate.getState()).toBe(STATES.IDLE);
    });

    it('reset saat IDLE tetap IDLE', () => {
      gate.reset();
      expect(gate.getState()).toBe(STATES.IDLE);
    });
  });

  describe('onEnter / onExit callbacks', () => {
    it('onEnter callback terpanggil saat masuk state', () => {
      const calls = [];
      gate.onEnter(STATES.CAMERA_ACTIVE, function () { calls.push('entered'); });
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      expect(calls).toEqual(['entered']);
    });

    it('onExit callback terpanggil saat keluar state', () => {
      const calls = [];
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.onExit(STATES.CAMERA_ACTIVE, function () { calls.push('exited'); });
      gate.transitionTo(STATES.LAR_CHECK);
      expect(calls).toEqual(['exited']);
    });
  });

  describe('fallbackTo()', () => {
    it('fallback ke state yang valid langsung transisi', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.fallbackTo(STATES.IDLE);
      expect(gate.getState()).toBe(STATES.IDLE);
    });

    it('fallback ke state invalid melewati IDLE dulu', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.transitionTo(STATES.LAR_CHECK);
      gate.fallbackTo(STATES.IDLE);
      expect(gate.getState()).toBe(STATES.IDLE);
    });

    it('fallback ke state yang sama no-op', () => {
      gate.transitionTo(STATES.CAMERA_ACTIVE);
      gate.fallbackTo(STATES.CAMERA_ACTIVE);
      expect(gate.getState()).toBe(STATES.CAMERA_ACTIVE);
    });
  });

  describe('threshold getter', () => {
    it('threshold memiliki high dan low', () => {
      const t = gate.threshold;
      expect(t.high).toBeTypeOf('number');
      expect(t.low).toBeTypeOf('number');
    });
  });
});
