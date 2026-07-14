const FFT_SIZE = 2048;
const NOISE_FLOOR_RMS = 0.01;
const MIN_PITCH_HZ = 50;
const MAX_PITCH_HZ = 800;

let audioContext = null;
let analyserNode = null;
let mediaStream = null;
let dataArray = null;

export async function initAudioStream() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const source = audioContext.createMediaStreamSource(mediaStream);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = FFT_SIZE;

  source.connect(analyserNode);
  dataArray = new Float32Array(analyserNode.fftSize);

  return audioContext;
}

/**
 * Tear down the audio pipeline completely.
 *
 * 1. Stop all MediaStream tracks (microphone hardware off).
 * 2. Await AudioContext.close() so the context reaches 'closed' state.
 * 3. Null all references to prevent stale reads.
 *
 * Returns a Promise that resolves once AudioContext.state === 'closed'.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function closeAudioStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    const ctx = audioContext;
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

function computeRMS(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

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

export function extractPitch() {
  if (!analyserNode || !dataArray) {return 0;}

  analyserNode.getFloatTimeDomainData(dataArray);

  const rms = computeRMS(dataArray);
  if (rms < NOISE_FLOOR_RMS) {return 0;}

  const sampleRate = audioContext.sampleRate;
  return autocorrelationPitch(dataArray, sampleRate);
}

export { FFT_SIZE, NOISE_FLOOR_RMS };
