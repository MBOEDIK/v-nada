import { f_min, f_max } from './constants.js';

const FFT_SIZE = 2048;
const NOISE_FLOOR_RMS = 0.01;
const TARGET_SAMPLE_RATE = 44100;
const RMS_CALIBRATION_FRAMES = 10;

let audioContext = null;
let analyserNode = null;
let mediaStream = null;
let dataArray = null;
let ambientNoiseFloor = NOISE_FLOOR_RMS;

async function ensureResumed(ctx) {
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

export async function calibrateAmbientNoise() {
  let totalRms = 0;
  let count = 0;
  for (let i = 0; i < RMS_CALIBRATION_FRAMES; i++) {
    if (!analyserNode || !dataArray) { break; }
    analyserNode.getFloatTimeDomainData(dataArray);
    const rms = computeRMS(dataArray);
    if (rms > 0) {
      totalRms += rms;
      count++;
    }
    await new Promise(function (r) { setTimeout(r, 50); });
  }
  if (count > 0) {
    ambientNoiseFloor = Math.max(NOISE_FLOOR_RMS, totalRms / count * 1.5);
  }
}

export function getAmbientNoiseFloor() {
  return ambientNoiseFloor;
}

export async function initAudioStream() {
  if (audioContext) {
    await ensureResumed(audioContext);
    return audioContext;
  }
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: { ideal: TARGET_SAMPLE_RATE },
      },
    });
  } catch (err) {
    const ctx = audioContext;
    audioContext = null;
    await ctx.close();
    throw err;
  }
  await ensureResumed(audioContext);
  const source = audioContext.createMediaStreamSource(mediaStream);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = FFT_SIZE;
  source.connect(analyserNode);
  dataArray = new Float32Array(analyserNode.fftSize);
  return audioContext;
}

export async function closeAudioStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(function (t) { t.stop(); });
    mediaStream = null;
  }
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
  }
  analyserNode = null;
  dataArray = null;
  ambientNoiseFloor = NOISE_FLOOR_RMS;
}

export function computeRMS(buffer) {
  if (!buffer || buffer.length === 0) { return 0; }
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

function autocorrelationPitch(buffer, sampleRate) {
  const minLag = Math.floor(sampleRate / f_max);
  const maxLag = Math.ceil(sampleRate / f_min);
  const len = buffer.length;

  const numLags = maxLag - minLag + 1;
  const corr = new Float64Array(numLags);
  let bestLag = -1;
  let bestCorrelation = -Infinity;

  for (let lag = minLag, idx = 0; lag <= maxLag; lag++, idx++) {
    let correlation = 0;
    for (let i = 0; i < len - lag; i++) {
      correlation += buffer[i] * buffer[i + lag];
    }
    correlation /= len - lag;
    corr[idx] = correlation;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }
  if (bestLag === -1) { return 0; }
  const pitch = sampleRate / bestLag;

  function subCheck(divisor) {
    const subLag = Math.round(bestLag * divisor);
    if (subLag >= minLag && subLag <= maxLag) {
      return corr[subLag - minLag] > 0.85;
    }
    return false;
  }
  if (subCheck(2)) { return pitch / 2; }
  if (subCheck(3)) { return pitch / 3; }
  if (subCheck(4)) { return pitch / 4; }

  return pitch;
}

export function extractPitch() {
  if (!analyserNode || !dataArray) { return 0; }
  analyserNode.getFloatTimeDomainData(dataArray);
  const rms = computeRMS(dataArray);
  if (rms < ambientNoiseFloor) { return 0; }
  const sampleRate = audioContext ? audioContext.sampleRate : TARGET_SAMPLE_RATE;
  return autocorrelationPitch(dataArray, sampleRate);
}

export function getPitchHz() {
  const p = extractPitch();
  return p > 0 ? p : 0;
}

export { FFT_SIZE, NOISE_FLOOR_RMS };
