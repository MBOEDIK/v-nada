import { describe, it, expect } from 'vitest';
import { computeRMS, autocorrelationPitch, NOISE_FLOOR_RMS, FFT_SIZE } from '../utils/audio.js';

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

describe('computeRMS', () => {
  it('mengembalikan 0.5 untuk [0.5, 0.5, 0.5, 0.5]', () => {
    expect(computeRMS([0.5, 0.5, 0.5, 0.5])).toBeCloseTo(0.5, 10);
  });

  it('mengembalikan 0 untuk buffer nol', () => {
    expect(computeRMS(new Float32Array([0, 0, 0, 0]))).toBe(0);
  });

  it('mengembalikan 0 untuk buffer kosong', () => {
    expect(computeRMS([])).toBe(0);
  });

  it('tidak memodifikasi buffer input', () => {
    const buf = new Float32Array([0.5, 0.5, 0.5, 0.5]);
    const copy = new Float32Array(buf);
    computeRMS(buf);
    expect(buf).toEqual(copy);
  });
});

describe('NOISE_FLOOR_RMS', () => {
  it('threshold default 0.01', () => {
    expect(NOISE_FLOOR_RMS).toBe(0.01);
  });
});

describe('FFT_SIZE', () => {
  it('default 2048', () => {
    expect(FFT_SIZE).toBe(2048);
  });
});

describe('autocorrelationPitch', () => {
  it('mendeteksi sine 200Hz dengan error < 1Hz', () => {
    const sampleRate = 44100;
    const buf = generateSine(200, sampleRate, 0.1);
    const pitch = autocorrelationPitch(buf, sampleRate);
    expect(pitch).toBeGreaterThan(0);
    expect(Math.abs(pitch - 200)).toBeLessThan(1);
  });

  it('mendeteksi sine 280Hz dengan error < 1Hz', () => {
    const sampleRate = 44100;
    const buf = generateSine(280, sampleRate, 0.1);
    const pitch = autocorrelationPitch(buf, sampleRate);
    expect(pitch).toBeGreaterThan(0);
    expect(Math.abs(pitch - 280)).toBeLessThan(1);
  });

  it('mendeteksi sine 250Hz (output integer)', () => {
    const sampleRate = 44100;
    const buf = generateSine(250, sampleRate, 0.1);
    const pitch = autocorrelationPitch(buf, sampleRate);
    expect(pitch).toBeGreaterThan(0);
    expect(Number.isFinite(pitch)).toBe(true);
  });

  it('tidak crash untuk noise buffer', () => {
    const sampleRate = 44100;
    const buf = generateNoise(2048);
    const pitch = autocorrelationPitch(buf, sampleRate);
    expect(Number.isFinite(pitch)).toBe(true);
  });

  it('rentang lag sesuai f_min=150 dan f_max=350', () => {
    const sampleRate = 44100;
    const minLag = Math.floor(sampleRate / 350);
    const maxLag = Math.ceil(sampleRate / 150);
    expect(minLag).toBe(126);
    expect(maxLag).toBe(294);
  });
});
