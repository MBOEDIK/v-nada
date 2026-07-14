const STATES = {
  IDLE: 'IDLE',
  CAMERA_ACTIVE: 'CAMERA_ACTIVE',
  LAR_CHECK: 'LAR_CHECK',
  MIC_OPEN: 'MIC_OPEN',
  SESSION_ACTIVE: 'SESSION_ACTIVE',
};

const VALID_TRANSITIONS = {
  [STATES.IDLE]: [STATES.CAMERA_ACTIVE],
  [STATES.CAMERA_ACTIVE]: [STATES.LAR_CHECK, STATES.MIC_OPEN, STATES.IDLE],
  [STATES.LAR_CHECK]: [STATES.MIC_OPEN, STATES.IDLE],
  [STATES.MIC_OPEN]: [STATES.SESSION_ACTIVE, STATES.LAR_CHECK, STATES.CAMERA_ACTIVE, STATES.IDLE],
  [STATES.SESSION_ACTIVE]: [STATES.IDLE],
};

class GateKeeper {
  #currentState = STATES.IDLE;
  #currentMode = null;
  #onEnterCallbacks = {};
  #onExitCallbacks = {};

  getState() {return this.#currentState;}

  getMode() {return this.#currentMode;}

  onEnter(state, callback) {this.#onEnterCallbacks[state] = callback;}

  onExit(state, callback) {this.#onExitCallbacks[state] = callback;}

  canTransitionTo(targetState) {
    const allowed = VALID_TRANSITIONS[this.#currentState];
    return allowed && allowed.includes(targetState);
  }

  transitionTo(targetState, options) {
    if (!this.canTransitionTo(targetState)) {
      console.warn(`[GateKeeper] Invalid transition: ${this.#currentState} → ${targetState}`);
      return;
    }

    const prevState = this.#currentState;

    if (this.#onExitCallbacks[prevState]) {
      this.#onExitCallbacks[prevState]();
    }

    this.#currentState = targetState;

    if (options && options.mode) {
      this.#currentMode = options.mode;
    }

    if (this.#onEnterCallbacks[targetState]) {
      this.#onEnterCallbacks[targetState]();
    }
  }

  reset() {
    const prevState = this.#currentState;
    if (this.#onExitCallbacks[prevState]) {
      this.#onExitCallbacks[prevState]();
    }
    this.#currentState = STATES.IDLE;
    this.#currentMode = null;
    if (this.#onEnterCallbacks[STATES.IDLE]) {
      this.#onEnterCallbacks[STATES.IDLE]();
    }
  }
}

const gatekeeper = new GateKeeper();

export { gatekeeper, STATES };
