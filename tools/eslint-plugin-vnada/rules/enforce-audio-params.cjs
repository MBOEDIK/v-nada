const ALLOWED_FFT_SIZES = new Set([2048, 4096]);
const REQUIRED_RMS = 0.01;
const REQUIRED_MIN_FPS = 15;
const REQUIRED_MAX_FPS = 20;
const MAX_RESOLUTION = 480;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce correct audio/vision parameters for low-end mobile',
      category: 'Critical',
    },
    messages: {
      wrongFft:
        'FFT_SIZE must be 2048 or 4096, found {{actual}}.',
      wrongRms:
        'NOISE_FLOOR_RMS must be {{expected}}, found {{actual}}.',
      wrongFps:
        'TARGET_FPS must be 15-20, found {{actual}}.',
      wrongResolution:
        'Camera resolution width/height must be ≤{{max}}, found {{actual}}.',
    },
  },
  create(context) {
    function checkNumber(node, name, expectedSet, messageId, extra) {
      if (
        node.id &&
        node.id.type === 'Identifier' &&
        node.id.name === name &&
        node.init &&
        node.init.type === 'Literal'
      ) {
        const val = node.init.value;
        if (!expectedSet(val)) {
          context.report({
            node,
            messageId,
            data: { actual: String(val), ...extra },
          });
        }
      }
    }

    return {
      VariableDeclarator(node) {
        checkNumber(node, 'FFT_SIZE', (v) => ALLOWED_FFT_SIZES.has(v), 'wrongFft', {});
        checkNumber(
          node,
          'NOISE_FLOOR_RMS',
          (v) => Math.abs(v - REQUIRED_RMS) < 0.001,
          'wrongRms',
          { expected: String(REQUIRED_RMS) }
        );
        checkNumber(
          node,
          'TARGET_FPS',
          (v) => v >= REQUIRED_MIN_FPS && v <= REQUIRED_MAX_FPS,
          'wrongFps',
          {}
        );
        checkNumber(
          node,
          'MAX_RESOLUTION',
          (v) => v <= MAX_RESOLUTION,
          'wrongResolution',
          { max: String(MAX_RESOLUTION) }
        );

        if (
          node.id &&
          node.id.type === 'Identifier' &&
          node.id.name === 'width' &&
          node.init &&
          node.init.type === 'Literal' &&
          node.init.value > MAX_RESOLUTION
        ) {
          context.report({
            node,
            messageId: 'wrongResolution',
            data: { actual: String(node.init.value), max: String(MAX_RESOLUTION) },
          });
        }

        if (
          node.id &&
          node.id.type === 'Identifier' &&
          node.id.name === 'height' &&
          node.init &&
          node.init.type === 'Literal' &&
          node.init.value > MAX_RESOLUTION
        ) {
          context.report({
            node,
            messageId: 'wrongResolution',
            data: { actual: String(node.init.value), max: String(MAX_RESOLUTION) },
          });
        }
      },
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          node.key.name === 'fftSize' &&
          node.value.type === 'Literal' &&
          !ALLOWED_FFT_SIZES.has(node.value.value)
        ) {
          context.report({
            node,
            messageId: 'wrongFft',
            data: { actual: String(node.value.value) },
          });
        }

        if (
          node.key.type === 'Identifier' &&
          (node.key.name === 'width' || node.key.name === 'height') &&
          node.value.type === 'Literal' &&
          node.value.value > MAX_RESOLUTION
        ) {
          context.report({
            node,
            messageId: 'wrongResolution',
            data: { actual: String(node.value.value), max: String(MAX_RESOLUTION) },
          });
        }
      },
    };
  },
};
