/**
 * audio.js — Real-time Microphone Capture & DSP Pipeline (TECH-03)
 *
 * Manages the Web Audio API lifecycle for the V-NADA Dual-Sense engine.
 * Captures microphone input → AnalyserNode → time-domain data extraction.
 *
 * CRITICAL SAFETY RULE:
 *   The analyserNode is NEVER connected to audioContext.destination.
 *   This prevents speaker feedback loops that would annoy the user.
 */

// ── Module Constants ────────────────────────────────────────────────

/**
 * FFT (Fast Fourier Transform) window size for the AnalyserNode.
 * Must be a power of 2 between 32 and 32256.
 *   - 2048 ≈ 46 ms window at 44.1 kHz (good pitch resolution)
 *   - 4096 ≈ 93 ms window at 44.1 kHz (finer frequency bins, higher latency)
 *
 * Enforced by architecture validation: only 2048 or 4096 are allowed.
 */
const FFT_SIZE = 2048;

/**
 * Noise Floor Gate — minimum RMS amplitude to consider as voiced speech.
 * Signals below this threshold are treated as silence; the expensive
 * autocorrelation loop is skipped entirely to save CPU on low-end devices.
 *
 * Declared as `export let` so future IndexedDB user profiles can override
 * the default value per-user (e.g. quieter environments \u2192 lower threshold).
 */
export let NOISE_FLOOR_RMS = 0.01; // eslint-disable-line prefer-const

/** Lowest pitch frequency (Hz) the autocorrelation search covers. */
const MIN_PITCH_HZ = 50;

/** Highest pitch frequency (Hz) the autocorrelation search covers. */
const MAX_PITCH_HZ = 800;

// ── Module-Scoped State (protected from GC, internal to this module) ─

/**
 * Web Audio API context — the audio processing graph owner.
 * Created fresh per session; set to `null` when the session closes.
 * May start in 'suspended' state due to browser autoplay policy;
 * `resume()` is called after the microphone stream is successfully acquired.
 */
let audioContext = null;

/**
 * AnalyserNode — performs FFT / time-domain sampling on the connected source.
 * Configured with fftSize = FFT_SIZE; its output is read via getFloatTimeDomainData().
 */
let analyserNode = null;

/**
 * MediaStream from getUserMedia({ audio: true }).
 * Stored so tracks can be stopped during close/cleanup.
 */
let mediaStream = null;

/**
 * Pre-allocated Float32Array sized to analyserNode.fftSize.
 * Reused every frame to avoid per-call GC pressure.
 */
let dataArray = null;

// ── Initialization ──────────────────────────────────────────────────

/**
 * Initialize the full audio capture pipeline.
 *
 * Flow:
 *   1. Create AudioContext (may be 'suspended' per browser autoplay policy).
 *   2. Request microphone permission via getUserMedia.
 *   3. Wire: MediaStreamSourceNode → AnalyserNode (NO connection to destination).
 *   4. Configure FFT and allocate the reusable Float32Array buffer.
 *   5. Resume the AudioContext to satisfy autoplay policy requirements.
 *
 * @returns {Promise<AudioContext>} The running AudioContext instance.
 * @throws {Error} If microphone permission is denied, no mic is found,
 *                 or any other initialization failure occurs.
 */
export async function initAudioStream() {
  // Step 1: Create AudioContext.
  // On modern browsers this may enter 'suspended' state until a user
  // gesture triggers resume() — handled in Step 5 below.
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Step 2: Request microphone access with structured error handling.
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    // Clean up the AudioContext we just created before re-throwing
    const ctx = audioContext;
    audioContext = null;
    await ctx.close();

    if (err.name === 'NotAllowedError') {
      throw new Error(
        'Microphone access denied. Please grant microphone permission in your browser settings to use this app.'
      );
    }
    if (err.name === 'NotFoundError') {
      throw new Error(
        'No microphone detected. Please connect a microphone or enable mic access to use this app.'
      );
    }
    if (err.name === 'NotReadableError') {
      throw new Error(
        'Microphone is in use by another application. Please close other apps using the mic and try again.'
      );
    }
    throw new Error(`Microphone initialization failed: ${err.message}`);
  }

  // Step 3: Wire audio nodes.
  //   source (MediaStreamSourceNode) → analyserNode
  //   ⚠️  NEVER connect analyserNode → audioContext.destination
  const source = audioContext.createMediaStreamSource(mediaStream);
  analyserNode = audioContext.createAnalyser();

  // Step 4: Configure AnalyserNode FFT and pre-allocate time-domain buffer.
  //   fftSize determines the frequency resolution:
  //     2048 samples → 1024 frequency bins → ~21.5 Hz resolution at 44.1 kHz.
  //   dataArray holds the raw time-domain waveform (Float32 amplitude values).
  analyserNode.fftSize = FFT_SIZE;
  dataArray = new Float32Array(analyserNode.fftSize);

  // Connect source → analyser ONLY (no destination wiring → no feedback loop).
  source.connect(analyserNode);

  // Step 5: Resume AudioContext to satisfy browser autoplay policy.
  //   Chrome, Safari, and Firefox require a user gesture before AudioContext
  //   can transition from 'suspended' to 'running'.  Since this function is
  //   called from a click-initiated pipeline, the gesture context is valid.
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
}

// ── Teardown ────────────────────────────────────────────────────────

/**
 * Tear down the audio pipeline completely and release all resources.
 *
 * Execution order:
 *   1. Stop all MediaStream tracks → microphone hardware releases instantly.
 *   2. Await AudioContext.close() → context transitions to 'closed' state.
 *   3. Null all module-scoped references → allow GC to reclaim memory.
 *
 * Returns a Promise that resolves once AudioContext.state === 'closed'.
 * Safe to call multiple times — subsequent calls are harmless no-ops.
 */
export async function closeAudioStream() {
  // 1. Release microphone hardware immediately
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  // 2. Close AudioContext asynchronously and verify final state
  if (audioContext) {
    const ctx = audioContext;

    // Null references before the async close to prevent stale reads
    // by any concurrent code paths (e.g. extractPitch running in onFrame).
    audioContext = null;
    analyserNode = null;
    dataArray = null;

    await ctx.close();

    if (ctx.state !== 'closed') {
      console.warn(
        `AudioContext state is '${ctx.state}' after close(), expected 'closed'.`
      );
    }
  }
}

// ── DSP: Root Mean Square ───────────────────────────────────────────

/**
 * Compute RMS (Root Mean Square) amplitude of a time-domain buffer.
 * Used as a noise floor gate — signals below NOISE_FLOOR_RMS are
 * treated as silence, skipping the expensive autocorrelation loop.
 *
 * Formula: RMS = sqrt( (1/N) * Σ x(i)² )   for i = 0..N-1
 *
 * Performance notes:
 *   - Single-pass `for` loop (V8 optimises traditional loops over .reduce())
 *   - Zero heap allocation — no objects, arrays, or closures created
 *   - Input is never mutated (read-only)
 *
 * @param {Float32Array|number[]} buffer - Time-domain sample buffer
 * @returns {number} RMS amplitude [0.0, 1.0]
 */
export function computeRMS(buffer) {
  const n = buffer.length;

  // Edge case: empty or falsy buffer → return 0 immediately.
  // Prevents division-by-zero (0/0 = NaN → sqrt(NaN) = NaN).
  if (!n) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += buffer[i] * buffer[i];
  }

  return Math.sqrt(sum / n);
}

const PITCH_CORRELATION_THRESHOLD = 0.4;

export function autocorrelationPitch(buffer, sampleRate) {
  if (!(buffer instanceof Float32Array) || buffer.length === 0) { return null; }
  if (!sampleRate || sampleRate <= 0) { return null; }

  const n = buffer.length;

  let energy = 0;
  for (let t = 0; t < n; t++) {
    energy += buffer[t] * buffer[t];
  }
  if (energy === 0) { return null; }

  const min_lag = Math.floor(sampleRate / MAX_PITCH_HZ);
  const max_lag = Math.ceil(sampleRate / MIN_PITCH_HZ);
  const safe_max_lag = Math.min(max_lag, n - 1);
  if (min_lag > safe_max_lag) { return null; }

  let best_lag = -1;
  let max_correlation = 0;
  const corrMap = new Map();

  for (let lag = min_lag; lag <= safe_max_lag; lag++) {
    let correlation = 0;
    for (let t = 0; t < n - lag; t++) {
      correlation += buffer[t] * buffer[t + lag];
    }
    const normalized = correlation / energy;
    corrMap.set(lag, normalized);
    if (normalized > max_correlation) {
      max_correlation = normalized;
      best_lag = lag;
    }
  }

  if (max_correlation < PITCH_CORRELATION_THRESHOLD || best_lag === -1) { return null; }

  let corrected = true;
  while (corrected) {
    corrected = false;
    for (let divisor = 2; divisor <= 4; divisor++) {
      if (best_lag % divisor !== 0) { continue; }
      const subLag = Math.floor(best_lag / divisor);
      if (subLag < min_lag) { continue; }
      const subCorr = corrMap.get(subLag);
      if (subCorr !== undefined && subCorr > max_correlation * 0.85) {
        best_lag = subLag;
        max_correlation = subCorr;
        corrected = true;
        break;
      }
    }
  }

  return sampleRate / best_lag;
}

/**
 * Extract the fundamental frequency (f0) from the current audio frame.
 *
 * This is the **single entry point** for all external consumers (VocaTone
 * game loop, main.js orchestrator, future Dual-Sense modules).
 *
 * Pipeline (zero memory allocation — reuses module-scoped dataArray):
 *   1. State guard — return null if module not initialized (no crash).
 *   2. Time-domain copy — AnalyserNode fills the pre-allocated Float32Array.
 *   3. RMS noise floor gate — return null if amplitude < 0.01 (silence).
 *   4. Normalized autocorrelation — return f0 in Hz or null (no pitch).
 *
 * @returns {number|null} Pitch in Hz, or `null` when:
 *   - Microphone is off / module not initialized
 *   - Audio frame is silent (RMS < NOISE_FLOOR_RMS)
 *   - No reliable pitch detected (unvoiced / correlation < 0.3)
 */
export function extractPitch() {
  // ── Step 1: State Initialization Guard ──────────────────────────
  // Return null safely if called before initAudioStream() or after
  // closeAudioStream(). No TypeError, no console error — silent null.
  if (!analyserNode || !dataArray) {
    return null;
  }

  // ── Step 2: Time-Domain Extraction ──────────────────────────────
  // Copies the current waveform into the pre-allocated Float32Array.
  // No new allocation — zero GC pressure at 60+ FPS.
  analyserNode.getFloatTimeDomainData(dataArray);

  // ── Step 3: RMS Noise Floor Gate ────────────────────────────────
  // Mathematical definition:
  //   RMS = sqrt( (1/N) * Σ x(i)² )   for i = 0..N-1
  //
  // If RMS < 0.01 the signal is below the room noise floor.
  // Early return saves ~95% of CPU by skipping autocorrelation on silence.
  const rms = computeRMS(dataArray);
  if (rms < NOISE_FLOOR_RMS) { return null; }

  // ── Step 4: Autocorrelation Execution ───────────────────────────
  // Delegates to the normalized autocorrelation algorithm which returns
  // either a valid f0 (Hz) or null (unvoiced / below threshold).
  const sample_rate = audioContext.sampleRate;
  return autocorrelationPitch(dataArray, sample_rate);
}

/**
 * Convenience getter for legacy consumers that expect a numeric `0`
 * instead of `null` when no pitch is detected.
 *
 * Wraps extractPitch() with a null-to-zero fallback.
 * Use this in contexts where downstream code does `pitch > 0` checks
 * and cannot handle null (e.g. VocaTone balloon Y-axis mapping).
 *
 * @returns {number} Pitch in Hz (0 when no pitch detected or mic inactive)
 */
export function getPitchHz() {
  const pitch = extractPitch();
  return pitch !== null ? pitch : 0;
}

export { FFT_SIZE };
