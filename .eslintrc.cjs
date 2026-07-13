module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['vnada'],
  rules: {
    'no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-restricted-globals': ['error', 'event', 'name', 'length', 'status'],
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'comma-dangle': ['error', 'only-multiline'],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-nested-ternary': 'error',
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always'],
    'no-implicit-globals': 'error',
    strict: ['error', 'never'],

    'vnada/no-node-modules': 'error',
    'vnada/enforce-snake-case': 'warn',
    'vnada/enforce-lar-indices': 'error',
    'vnada/enforce-audio-params': 'error',
    'vnada/enforce-fat-finger': 'warn',
  },
  globals: {
    indexedDB: 'readonly',
    AudioContext: 'readonly',
    webkitAudioContext: 'readonly',
    MediaPipe: 'readonly',
    requestAnimationFrame: 'readonly',
    caches: 'readonly',
    navigator: 'readonly',
    process: 'readonly',
  },
  overrides: [
    {
      files: ['*.cjs', 'tools/**/*.cjs', 'tools/**/*.js', '.eslintrc.cjs'],
      env: { commonjs: true, node: true },
      rules: {
        'no-undef': 'off',
        'vnada/no-node-modules': 'off',
      },
    },
    {
      files: ['scripts/**/*.js', 'scripts/**/*.mjs'],
      env: { node: true },
      rules: {
        'vnada/no-node-modules': 'off',
      },
    },
    {
      files: ['src/**/*.js', 'src/**/*.mjs'],
      env: { browser: true },
      rules: {
        'vnada/no-node-modules': 'error',
      },
    },
  ],
};
