import { vi } from 'vitest';
import { createMockAudioContext, createMockMediaStream } from './mocks/webaudio.js';

window.AudioContext = vi.fn(function () {
  return createMockAudioContext(44100);
});
window.webkitAudioContext = window.AudioContext;

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(function () {
      return Promise.resolve(createMockMediaStream());
    }),
  },
  configurable: true,
});
