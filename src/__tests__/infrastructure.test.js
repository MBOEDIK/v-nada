/* eslint-disable vnada/no-node-modules */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd());

describe('A1.1 — Inisialisasi Project Vite + Tailwind', () => {
  it('package.json memiliki script dev, build, lint, test', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('test');
  });

  it('index.html memiliki canvas element', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');
    expect(html).toContain('<canvas');
    expect(html).toContain('id="overlay-canvas"');
  });

  it('fat-finger: start/stop button min 60x60dp', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');
    expect(html).toContain('min-w-[60px]');
    expect(html).toContain('min-h-[60px]');
  });
});

describe('A1.3 — Konfigurasi Manifest + Icon', () => {
  it('icon files exist dan >100 bytes', () => {
    const icon192 = readFileSync(resolve(ROOT, 'public/icons/icon-192x192.png'));
    const icon512 = readFileSync(resolve(ROOT, 'public/icons/icon-512x512.png'));
    expect(icon192.length).toBeGreaterThan(100);
    expect(icon512.length).toBeGreaterThan(100);
  });

  it('vite.config.js memiliki manifest config (display, theme, icons)', () => {
    const cfg = readFileSync(resolve(ROOT, 'vite.config.js'), 'utf-8');
    expect(cfg).toContain('display:');
    expect(cfg).toContain('\'standalone\'');
    expect(cfg).toContain('theme_color');
    expect(cfg).toContain('background_color');
    expect(cfg).toContain('icon-192x192');
    expect(cfg).toContain('icon-512x512');
  });
});
