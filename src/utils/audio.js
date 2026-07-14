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

/** Minimum RMS amplitude to consider as voiced speech (below this = silence). */
const NOISE_FLOOR_RMS = 0.01;

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
 * Used as a voice activity detector — signals below NOISE_FLOOR_RMS
 * are treated as silence to save autocorrelation CPU cycles.
 *
 * @param {Float32Array} buffer - Time-domain sample buffer
 * @returns {number} RMS amplitude [0.0, 1.0]
 */
function computeRMS(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

// ── DSP: Autocorrelation Pitch Detection ────────────────────────────

/**
 * Detect fundamental frequency (f0) via time-domain autocorrelation.
 *
 * Algorithm:
 *   For each candidate lag in [sampleRate/MAX_PITCH_HZ, sampleRate/MIN_PITCH_HZ]:
 *     Compute the autocorrelation R(lag) = Σ x[i] * x[i+lag]
 *     Track the lag with the highest correlation value.
 *   f0 = sampleRate / bestLag
 *
 * The lag range [50 Hz – 800 Hz] covers the full human speaking range
 * from chest voice (f0 ≈ 85–180 Hz) to child/falsetto (up to 800 Hz).
 *
 * @param {Float32Array} buffer   - Time-domain audio samples
 * @param {number}       sampleRate - Context sample rate (44100 or 48000)
 * @returns {number} Detected f0 in Hz, or 0 if no clear pitch found
 */
function autocorrelationPitch(buffer, sampleRate) {
  const minLag = Math.floor(sampleRate / MAX_PITCH_HZ);
  const maxLag = Math.ceil(sampleRate / MIN_PITCH_HZ);
  let bestLag = -1;
  let bestCorrelation = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - lag; i++) {
      correlation += buffer[i] * buffer[i + lag];
    }
    correlation /= buffer.length - lag;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag === -1) {return 0;}
  return sampleRate / bestLag;
}

// ── Public API: Pitch Extraction ────────────────────────────────────

/**
 * Extract the fundamental frequency (f0) from the current audio frame.
 *
 * Pipeline:
 *   1. Read time-domain data into the pre-allocated Float32Array.
 *   2. Compute RMS → skip if below NOISE_FLOOR_RMS (silence gate).
 *   3. Run autocorrelation → return f0 in Hz.
 *
 * @returns {number} Pitch in Hz (0 if silence or no pitch detected)
 */
export function extractPitch() {
  if (!analyserNode || !dataArray) {return 0;}

  // Fill dataArray with current time-domain waveform from the AnalyserNode
  analyserNode.getFloatTimeDomainData(dataArray);

  // Noise floor gate: skip DSP when amplitude is below room noise
  const rms = computeRMS(dataArray);
  if (rms < NOISE_FLOOR_RMS) {return 0;}

  const sampleRate = audioContext.sampleRate;
  return autocorrelationPitch(dataArray, sampleRate);
}

export { FFT_SIZE, NOISE_FLOOR_RMS };
