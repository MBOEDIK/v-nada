/* eslint-disable no-console */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = resolve(ROOT, 'src');

const NODE_MODULES = [
  'fs', 'path', 'crypto', 'express', 'http', 'https', 'net', 'os',
  'child_process', 'cluster', 'dns', 'dgram', 'readline', 'stream',
  'worker_threads', 'zlib', 'util', 'events', 'http2',
];

const LANDMARK_INDICES = { top: 13, bottom: 14, left: 78, right: 308 };
const ALLOWED_FFT = [2048, 4096];
const REQUIRED_RMS = 0.01;
const MIN_FPS = 15;
const MAX_FPS = 20;
const MAX_RESOLUTION = 480;
const MIN_TOUCH = 60;
const SNAKE_NAMES = [
  'user_id', 'lar_threshold', 'f_min', 'f_max',
  'session_id', 'timestamp', 'module_type',
  'lar_accuracy', 'fo_stability', 'star_score',
];

const errors = [];
const warnings = [];

function logError(file, msg) {
  errors.push(`  ❌ ${file}: ${msg}`);
}

function logWarn(file, msg) {
  warnings.push(`  ⚠️  ${file}: ${msg}`);
}

function readFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

function walkDir(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = resolve(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry !== 'node_modules' && entry !== '.git') {
          files.push(...walkDir(full));
        }
      } else {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

function checkNodeImports(content, file) {
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const mod = match[1];
    if (mod.startsWith('node:')) {
      logError(file, `Node.js built-in import: "${mod}" — FORBIDDEN in client-side code.`);
    } else {
      const bare = mod.split('/')[0];
      if (NODE_MODULES.includes(bare)) {
        logError(file, `Node.js module import: "${mod}" — FORBIDDEN in client-side code.`);
      }
    }
  }

  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    const mod = match[1];
    if (mod.startsWith('node:') || NODE_MODULES.includes(mod.split('/')[0])) {
      logError(file, `Node.js require: "${mod}" — FORBIDDEN in client-side code.`);
    }
  }
}

function checkSnakeCase(content, file) {
  for (const name of SNAKE_NAMES) {
    if (!name.includes('_')) { continue; }
    const camelVariants = [
      name.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      name.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase()),
    ];
    for (const variant of camelVariants) {
      const regex = new RegExp(`\\b${variant}\\b`);
      if (regex.test(content)) {
        logWarn(file, `Found camelCase "${variant}" — should be snake_case "${name}".`);
      }
    }
  }
}

function checkLarIndices(content, file) {
  const topMatch = content.match(/\btop\s*[=:]\s*(\d+)/);
  const bottomMatch = content.match(/\bbottom\s*[=:]\s*(\d+)/);
  const leftMatch = content.match(/\bleft\s*[=:]\s*(\d+)/);
  const rightMatch = content.match(/\bright\s*[=:]\s*(\d+)/);

  const checks = [
    { name: 'top', actual: topMatch ? parseInt(topMatch[1]) : null },
    { name: 'bottom', actual: bottomMatch ? parseInt(bottomMatch[1]) : null },
    { name: 'left', actual: leftMatch ? parseInt(leftMatch[1]) : null },
    { name: 'right', actual: rightMatch ? parseInt(rightMatch[1]) : null },
  ];

  for (const c of checks) {
    if (c.actual !== null && c.actual !== LANDMARK_INDICES[c.name]) {
      logError(file, `LAR landmark "${c.name}" = ${c.actual}, expected ${LANDMARK_INDICES[c.name]}.`);
    }
  }
}

function checkAudioParams(content, file) {
  const fftMatch = content.match(/\bFFT_SIZE\s*[=:]\s*(\d+)/);
  if (fftMatch) {
    const val = parseInt(fftMatch[1]);
    if (!ALLOWED_FFT.includes(val)) {
      logError(file, `FFT_SIZE = ${val}, must be 2048 or 4096.`);
    }
  }

  const rmsMatch = content.match(/\bNOISE_FLOOR_RMS\s*[=:]\s*([\d.]+)/);
  if (rmsMatch) {
    const val = parseFloat(rmsMatch[1]);
    if (Math.abs(val - REQUIRED_RMS) > 0.001) {
      logError(file, `NOISE_FLOOR_RMS = ${val}, must be ${REQUIRED_RMS}.`);
    }
  }

  const fpsMatch = content.match(/\bTARGET_FPS\s*[=:]\s*(\d+)/);
  if (fpsMatch) {
    const val = parseInt(fpsMatch[1]);
    if (val < MIN_FPS || val > MAX_FPS) {
      logError(file, `TARGET_FPS = ${val}, must be ${MIN_FPS}-${MAX_FPS}.`);
    }
  }

  const widthMatches = content.matchAll(/\b(width)\s*[=:]\s*(\d+)/g);
  for (const m of widthMatches) {
    const val = parseInt(m[2]);
    if (val > MAX_RESOLUTION) {
      logError(file, `Camera ${m[1]} = ${val}, max ${MAX_RESOLUTION}px.`);
    }
  }

  const heightMatches = content.matchAll(/\b(height)\s*[=:]\s*(\d+)/g);
  for (const m of heightMatches) {
    const val = parseInt(m[2]);
    if (val > MAX_RESOLUTION) {
      logError(file, `Camera ${m[1]} = ${val}, max ${MAX_RESOLUTION}px.`);
    }
  }
}

function checkFatFinger(content, file) {
  const tagRegex = /<(button|a)\b[^>]*>/gi;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1];
    const hasMinW = new RegExp(`min-w-\\[${MIN_TOUCH}px\\]`).test(match[0]);
    const hasMinH = new RegExp(`min-h-\\[${MIN_TOUCH}px\\]`).test(match[0]);
    if (!hasMinW || !hasMinH) {
      logWarn(file, `<${tag}> missing min-w-[${MIN_TOUCH}px] or min-h-[${MIN_TOUCH}px].`);
    }
  }
}

function checkPipelineFlow(content, file) {
  const hasVisionImport = content.includes('./utils/vision') || content.includes('vision.js');
  const hasAudioImport = content.includes('./utils/audio') || content.includes('audio.js');
  const hasLarCall = content.includes('computeLipAspectRatio');
  const hasPitchCall = content.includes('extractPitch');
  const hasGateCheck = content.includes('lar >= larThreshold') || content.includes('LAR_actual') || content.includes('lar >=');

  if (hasVisionImport && hasAudioImport) {
    if (!hasGateCheck) {
      logWarn(file, 'Sequential gate check (LAR >= threshold) not detected. Pipeline may not enforce vision-before-audio order.');
    }
    if (!hasLarCall) {
      logWarn(file, 'computeLipAspectRatio() not called in main pipeline.');
    }
    if (!hasPitchCall) {
      logWarn(file, 'extractPitch() not called in main pipeline.');
    }
  }
}

function checkIndexedDBSchema(content, file) {
  const hasUserProfiles = content.includes('user_profiles');
  const hasTrainingSessions = content.includes('training_sessions');
  const hasUserId = content.includes('user_id');
  const hasSessionId = content.includes('session_id');

  if (hasUserProfiles && !hasUserId) {
    logError(file, 'user_profiles store defined but user_id keyPath not found.');
  }
  if (hasTrainingSessions && !hasSessionId) {
    logError(file, 'training_sessions store defined but session_id keyPath not found.');
  }
}

function checkHtmlManifest(content, file) {
  if (!content.includes('manifest.webmanifest') && !content.includes('manifest.json')) {
    logWarn(file, 'No manifest link found in <head>. PWA installation may be missing.');
  }
  if (!content.includes('theme-color')) {
    logWarn(file, 'Missing theme-color meta tag.');
  }
}

console.log('\n🔍 V-NADA Architecture Validation');
console.log('══════════════════════════════════\n');

const files = walkDir(SRC);

for (const file of files) {
  const ext = extname(file);
  const rel = file.replace(ROOT.replace(/\\/g, '/'), '').replace(/^\//, '');
  const content = readFile(file);
  if (!content) {continue;}

  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    if (!rel.includes('__tests__')) {
      checkNodeImports(content, rel);
    }
    checkSnakeCase(content, rel);
    checkLarIndices(content, rel);
    checkAudioParams(content, rel);
    checkPipelineFlow(content, rel);
    checkIndexedDBSchema(content, rel);
  }
}

const htmlFiles = files.filter((f) => extname(f) === '.html');
for (const file of htmlFiles) {
  const rel = file.replace(ROOT.replace(/\\/g, '/'), '').replace(/^\//, '');
  const content = readFile(file);
  if (content) {
    checkFatFinger(content, rel);
    checkHtmlManifest(content, rel);
  }
}

const indexHtml = resolve(ROOT, 'index.html');
if (existsSync(indexHtml)) {
  const content = readFile(indexHtml);
  if (content) {
    checkFatFinger(content, 'index.html');
    checkHtmlManifest(content, 'index.html');
  }
}

console.log('\n📊 Results:');
console.log(`   Errors:   ${errors.length}`);
console.log(`   Warnings: ${warnings.length}`);
console.log('');

if (errors.length > 0) {
  console.log('❌ ERRORS (hard violations — must fix):');
  errors.forEach((e) => console.log(e));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (should fix):');
  warnings.forEach((w) => console.log(w));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All architecture checks passed!');
}

process.exit(errors.length > 0 ? 1 : 0);
