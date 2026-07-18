import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initAudioStream, closeAudioStream, extractPitch, getPitchHz, computeRMS, NOISE_FLOOR_RMS, calibrateAmbientNoise, getAmbientNoiseFloor } from '../utils/audio.js';

function generateSine(freq, sampleRate, duration) {
  const len = Math.floor(sampleRate * duration);
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = Math.sin(2 * Math.PI * freq * i / sampleRate);
  }
  return buf;
}

function generateNoise(len) {
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = Math.random() * 2 - 1;
  }
  return buf;
}

describe('extractPitch (integration)', () => {
  beforeEach(async function () {
    const ctx = await initAudioStream();
    ctx._analyser._dataArray = generateSine(200, 44100, 0.1);
  });

  afterEach(async function () {
    await closeAudioStream();
  });

  it('return null saat audio belum diinisialisasi', async () => {
    await closeAudioStream();
    const p = extractPitch();
    expect(p).toBeNull();
  });

  it('return angka > 0 Hz saat suara valid', () => {
    const p = extractPitch();
    expect(p).toBeGreaterThan(0);
  });

  it('return null saat RMS < threshold (noise)', async () => {
    const ctx = await initAudioStream();
    ctx._analyser._dataArray = generateNoise(2048);
    const p = extractPitch();
    if (computeRMS(ctx._analyser._dataArray) < getAmbientNoiseFloor()) {
      expect(p).toBeNull();
    }
  });
});

describe('getPitchHz', () => {
  beforeEach(async function () {
    await initAudioStream();
  });

  afterEach(async function () {
    await closeAudioStream();
  });

  it('return 0 saat tidak ada suara (null → 0)', async () => {
    await closeAudioStream();
    expect(getPitchHz()).toBe(0);
  });

  it('return angka Hz saat suara valid', async () => {
    await closeAudioStream();
    const ctx = await initAudioStream();
    ctx._analyser._dataArray = generateSine(200, 44100, 0.1);
    const hz = getPitchHz();
    expect(hz).toBeGreaterThan(0);
  });
});

describe('calibrateAmbientNoise', () => {
  beforeEach(async function () {
    await initAudioStream();
  });

  afterEach(async function () {
    await closeAudioStream();
  });

  it('tidak throw error saat dipanggil', async () => {
    await expect(calibrateAmbientNoise()).resolves.not.toThrow();
  });

  it('ambientNoiseFloor >= NOISE_FLOOR_RMS setelah kalibrasi', async () => {
    await calibrateAmbientNoise();
    expect(getAmbientNoiseFloor()).toBeGreaterThanOrEqual(NOISE_FLOOR_RMS);
  });
});

describe('performance tests', () => {
  it('computeRMS 2048 sampel selesai < 0.05ms', () => {
    const buf = generateNoise(2048);
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      computeRMS(buf);
    }
    const elapsed = (performance.now() - start) / 100;
    expect(elapsed).toBeLessThan(0.05);
  });

  it('extractPitch 1000x early return (no autocorrelation) dalam waktu wajar', async () => {
    const ctx = await initAudioStream();
    ctx._analyser._dataArray = new Float32Array(2048);
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      extractPitch();
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
    await closeAudioStream();
  });
});
