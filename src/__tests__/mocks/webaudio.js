export function createMockAnalyserNode(fftSize) {
  const mock = {
    fftSize: fftSize || 2048,
    frequencyBinCount: (fftSize || 2048) / 2,
    _dataArray: new Float32Array(fftSize || 2048),
    getFloatTimeDomainData: function (arr) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = this._dataArray[i] || 0;
      }
    },
    getByteTimeDomainData: function () {},
    getFloatFrequencyData: function () {},
    getByteFrequencyData: function () {},
    connect: function () { return this; },
    disconnect: function () {},
  };
  return mock;
}

export function createMockAudioContext(sampleRate) {
  const analyser = createMockAnalyserNode(2048);
  const ctx = {
    state: 'running',
    sampleRate: sampleRate || 44100,
    destination: { _isMock: true },
    createAnalyser: function () { return analyser; },
    createMediaStreamSource: function () {
      return { connect: function () { return analyser; } };
    },
    resume: function () { return Promise.resolve(); },
    close: function () { return Promise.resolve(); },
    _analyser: analyser,
  };
  return ctx;
}

export function createMockMediaStream() {
  const track = {
    kind: 'audio',
    stop: function () { this._stopped = true; },
    _stopped: false,
  };
  return {
    getTracks: function () { return [track]; },
    getAudioTracks: function () { return [track]; },
    _track: track,
  };
}
