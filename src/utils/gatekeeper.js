import { lar_threshold } from './constants.js';

export const STATES = {
  IDLE: 'IDLE',
  CAMERA_ACTIVE: 'CAMERA_ACTIVE',
  LAR_CHECK: 'LAR_CHECK',
  MIC_OPEN: 'MIC_OPEN',
  SESSION_ACTIVE: 'SESSION_ACTIVE',
};

const VALID_TRANSITIONS = {
  [STATES.IDLE]: [STATES.CAMERA_ACTIVE],
  [STATES.CAMERA_ACTIVE]: [STATES.LAR_CHECK, STATES.IDLE],
  [STATES.LAR_CHECK]: [STATES.MIC_OPEN, STATES.CAMERA_ACTIVE, STATES.IDLE],
  [STATES.MIC_OPEN]: [STATES.SESSION_ACTIVE, STATES.LAR_CHECK, STATES.CAMERA_ACTIVE, STATES.IDLE],
  [STATES.SESSION_ACTIVE]: [STATES.MIC_OPEN, STATES.IDLE],
};

export class GateKeeper {
  constructor() {
    this._state = STATES.IDLE;
    this._mode = null;
    this._listeners = {};
    this._exitListeners = {};
    for (const s of Object.values(STATES)) {
      this._listeners[s] = [];
      this._exitListeners[s] = [];
    }
  }

  getState() {
    return this._state;
  }

  getMode() {
    return this._mode;
  }

  transitionTo(newState, options = {}) {
    const valid = VALID_TRANSITIONS[this._state];
    if (!valid || !valid.includes(newState)) {
      throw new Error(
        `GateKeeper: invalid transition ${this._state} -> ${newState}`
      );
    }
    const prev = this._state;
    for (const cb of this._exitListeners[prev]) { cb(); }
    this._state = newState;
    this._mode = options.mode || null;
    for (const cb of this._listeners[newState]) { cb(options); }
  }

  reset() {
    if (this._state !== STATES.IDLE) {
      this.transitionTo(STATES.IDLE);
    }
  }

  fallbackTo(state, options = {}) {
    if (state === this._state) { return; }
    const valid = VALID_TRANSITIONS[this._state];
    if (valid && valid.includes(state)) {
      this.transitionTo(state, options);
    } else {
      if (this._state !== STATES.IDLE) {
        this.transitionTo(STATES.IDLE);
      }
      this.transitionTo(state, options);
    }
  }

  get threshold() {
    return lar_threshold;
  }

  onEnter(state, callback) {
    this._listeners[state].push(callback);
  }

  onExit(state, callback) {
    this._exitListeners[state].push(callback);
  }
}
