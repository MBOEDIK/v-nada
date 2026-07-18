const STATES = Object.freeze({
  IDLE: 'IDLE',
  CAMERA_ACTIVE: 'CAMERA_ACTIVE',
  LAR_CHECK: 'LAR_CHECK',
  MIC_OPEN: 'MIC_OPEN',
  SESSION_ACTIVE: 'SESSION_ACTIVE',
});

const VALID_TRANSITIONS = Object.freeze({
  [STATES.IDLE]: [STATES.CAMERA_ACTIVE],
  [STATES.CAMERA_ACTIVE]: [STATES.LAR_CHECK, STATES.MIC_OPEN, STATES.IDLE],
  [STATES.LAR_CHECK]: [STATES.MIC_OPEN, STATES.IDLE],
  [STATES.MIC_OPEN]: [STATES.SESSION_ACTIVE, STATES.LAR_CHECK, STATES.CAMERA_ACTIVE, STATES.IDLE],
  [STATES.SESSION_ACTIVE]: [STATES.IDLE, STATES.CAMERA_ACTIVE],
});

const ACTIVE_STATES = Object.freeze([
  STATES.LAR_CHECK,
  STATES.MIC_OPEN,
  STATES.SESSION_ACTIVE,
]);

class GateKeeper {
  #currentState = STATES.IDLE;
  #currentMode = null;
  #hooks = new Map();

  getState() { return this.#currentState; }

  getMode() { return this.#currentMode; }

  onEnter(state, callback) {
    if (!this.#hooks.has(state)) {
      this.#hooks.set(state, { enter: null, exit: null });
    }
    this.#hooks.get(state).enter = callback;
  }

  onExit(state, callback) {
    if (!this.#hooks.has(state)) {
      this.#hooks.set(state, { enter: null, exit: null });
    }
    this.#hooks.get(state).exit = callback;
  }

  canTransitionTo(targetState) {
    if (!Object.values(STATES).includes(targetState)) { return false; }
    if (targetState === STATES.IDLE) { return true; }
    const allowed = VALID_TRANSITIONS[this.#currentState];
    if (allowed && allowed.includes(targetState)) { return true; }
    if (targetState === STATES.CAMERA_ACTIVE && ACTIVE_STATES.includes(this.#currentState)) { return true; }
    return false;
  }

  transitionTo(targetState, options) {
    if (!this.canTransitionTo(targetState)) {
      console.warn(`[GateKeeper] Invalid transition: ${this.#currentState} → ${targetState}`);
      return;
    }

    this.#exitCurrentState();
    this.#currentState = targetState;
    if (options && options.mode) {
      this.#currentMode = options.mode;
    }
    this.#enterCurrentState();
  }

  fallbackTo(targetState) {
    if (targetState !== STATES.CAMERA_ACTIVE) {
      throw new Error(`Invalid fallback target: '${targetState}'. Use reset() for IDLE.`);
    }
    if (!ACTIVE_STATES.includes(this.#currentState)) {
      throw new Error(`Cannot fallback from '${this.#currentState}'.`);
    }
    this.#exitCurrentState();
    this.#currentState = STATES.CAMERA_ACTIVE;
    this.#enterCurrentState();
  }

  reset() {
    this.#exitCurrentState();
    this.#currentState = STATES.IDLE;
    this.#currentMode = null;
    this.#enterCurrentState();
  }

  #exitCurrentState() {
    const hook = this.#hooks.get(this.#currentState);
    if (hook && typeof hook.exit === 'function') {
      hook.exit(this.#currentState);
    }
  }

  #enterCurrentState() {
    const hook = this.#hooks.get(this.#currentState);
    if (hook && typeof hook.enter === 'function') {
      hook.enter(this.#currentState);
    }
  }
}

const gatekeeper = new GateKeeper();

export { gatekeeper, STATES };
