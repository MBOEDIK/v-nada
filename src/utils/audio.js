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

export function closeAudioStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyserNode = null;
  dataArray = null;
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

  let energy = 0;
  for (let i = 0; i < buffer.length; i++) {
    energy += buffer[i] * buffer[i];
  }
  if (energy === 0) {return null;}

  let bestLag = -1;
  let bestCorrelation = -Infinity;
  const corrMap = new Map();

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - lag; i++) {
      correlation += buffer[i] * buffer[i + lag];
    }
    correlation /= energy;
    corrMap.set(lag, correlation);

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag === -1 || bestCorrelation < 0.3) {return null;}

  let corrected = true;
  while (corrected) {
    corrected = false;
    for (let divisor = 2; divisor <= 4; divisor++) {
      if (bestLag % divisor !== 0) {continue;}
      const subLag = Math.floor(bestLag / divisor);
      if (subLag < minLag) {continue;}
      const subCorr = corrMap.get(subLag);
      if (subCorr !== undefined && subCorr > bestCorrelation * 0.85) {
        bestLag = subLag;
        bestCorrelation = subCorr;
        corrected = true;
        break;
      }
    }
  }

  return sampleRate / bestLag;
}

export function extractPitch() {
  if (!analyserNode || !dataArray) {return null;}

  analyserNode.getFloatTimeDomainData(dataArray);

  const rms = computeRMS(dataArray);
  if (rms < NOISE_FLOOR_RMS) {return null;}

  const sampleRate = audioContext.sampleRate;
  return autocorrelationPitch(dataArray, sampleRate);
}

export { FFT_SIZE, NOISE_FLOOR_RMS };
