const STATES = Object.freeze({
  IDLE: 'IDLE',
  CAMERA_ACTIVE: 'CAMERA_ACTIVE',
  LAR_CHECK: 'LAR_CHECK',
  MIC_OPEN: 'MIC_OPEN',
  SESSION_ACTIVE: 'SESSION_ACTIVE',
});

const VALID_TRANSITIONS = Object.freeze({
  [STATES.IDLE]: [STATES.CAMERA_ACTIVE],
  [STATES.CAMERA_ACTIVE]: [STATES.LAR_CHECK],
  [STATES.LAR_CHECK]: [STATES.MIC_OPEN],
  [STATES.MIC_OPEN]: [STATES.SESSION_ACTIVE],
  [STATES.SESSION_ACTIVE]: [STATES.IDLE],
});

/** States that represent an active audio/sensor zone (beyond idle camera). */
const ACTIVE_STATES = Object.freeze([
  STATES.LAR_CHECK,
  STATES.MIC_OPEN,
  STATES.SESSION_ACTIVE,
]);

class GateKeeper {
  #currentState;
  #hooks;

  constructor() {
    this.#currentState = STATES.IDLE;
    this.#hooks = new Map();
  }

  getState() {
    return this.#currentState;
  }

  /**
   * Check whether a forward or fallback transition to targetState is allowed.
   *
   * Allowed paths:
   *   - Forward: strictly sequential per VALID_TRANSITIONS
   *   - Fallback: any ACTIVE_STATE → CAMERA_ACTIVE (LAR drop, Condition A)
   *   - IDLE: always reachable (hard reset or stopSession)
   */
  canTransitionTo(targetState) {
    if (!Object.values(STATES).includes(targetState)) {
      return false;
    }
    if (targetState === STATES.IDLE) {
      return true;
    }
    // Forward sequential transition
    const allowed = VALID_TRANSITIONS[this.#currentState];
    if (allowed && allowed.includes(targetState)) {
      return true;
    }
    // Fallback to CAMERA_ACTIVE from any active state
    if (targetState === STATES.CAMERA_ACTIVE && ACTIVE_STATES.includes(this.#currentState)) {
      return true;
    }
    return false;
  }

  /**
   * Forward sequential transition (IDLE → CAMERA_ACTIVE → LAR_CHECK → …).
   *
   * Throws if the requested transition is not in VALID_TRANSITIONS.
   * Special case: transitionTo(IDLE) always succeeds (hard stop).
   */
  transitionTo(targetState) {
    if (!Object.values(STATES).includes(targetState)) {
      throw new Error(
        `Invalid state: '${targetState}'. Valid states are: ${Object.values(STATES).join(', ')}.`
      );
    }

    if (targetState === STATES.IDLE) {
      this.#exitCurrentState();
      this.#currentState = STATES.IDLE;
      this.#enterCurrentState();
      return;
    }

    const allowed = VALID_TRANSITIONS[this.#currentState];
    if (!allowed || !allowed.includes(targetState)) {
      throw new Error(
        `Invalid transition: '${this.#currentState}' → '${targetState}'. ` +
        `Allowed transitions from '${this.#currentState}': ${(allowed || []).join(', ') || 'none'}. ` +
        'Forward transitions must be strictly sequential.'
      );
    }

    this.#exitCurrentState();
    this.#currentState = targetState;
    this.#enterCurrentState();
  }

  /**
   * Backward fallback transition for Instant Fallback (Condition A).
   *
   * Degrades from any ACTIVE_STATE (LAR_CHECK, MIC_OPEN, SESSION_ACTIVE)
   * back to CAMERA_ACTIVE when LAR drops below threshold but the face
   * is still detected.  The camera stays on for continued monitoring.
   *
   * Only CAMERA_ACTIVE is a valid fallback target.
   * For hard reset to IDLE, use reset() or transitionTo(IDLE).
   *
   * @param {string} targetState - Must be STATES.CAMERA_ACTIVE
   */
  fallbackTo(targetState) {
    if (targetState !== STATES.CAMERA_ACTIVE) {
      throw new Error(
        `Invalid fallback target: '${targetState}'. ` +
        'fallbackTo() only supports CAMERA_ACTIVE. Use reset() for IDLE.'
      );
    }

    if (!ACTIVE_STATES.includes(this.#currentState)) {
      throw new Error(
        `Cannot fallback from '${this.#currentState}' to CAMERA_ACTIVE. ` +
        `Fallback requires one of: ${ACTIVE_STATES.join(', ')}.`
      );
    }

    this.#exitCurrentState();
    this.#currentState = STATES.CAMERA_ACTIVE;
    this.#enterCurrentState();
  }

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

  reset() {
    this.#exitCurrentState();
    this.#currentState = STATES.IDLE;
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

export { STATES };
export default gatekeeper;
