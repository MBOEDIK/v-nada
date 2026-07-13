const noNodeModules = require('./rules/no-node-modules.cjs');
const enforceSnakeCase = require('./rules/enforce-snake-case.cjs');
const enforceLarIndices = require('./rules/enforce-lar-indices.cjs');
const enforceAudioParams = require('./rules/enforce-audio-params.cjs');
const enforceFatFinger = require('./rules/enforce-fat-finger.cjs');

module.exports = {
  rules: {
    'no-node-modules': noNodeModules,
    'enforce-snake-case': enforceSnakeCase,
    'enforce-lar-indices': enforceLarIndices,
    'enforce-audio-params': enforceAudioParams,
    'enforce-fat-finger': enforceFatFinger,
  },
};
