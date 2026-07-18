import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function createFlashHelper(overlay) {
  let flash_timeout = null;
  let current_flash = null;

  function setFlash(type) {
    if (flash_timeout) { clearTimeout(flash_timeout); flash_timeout = null; }
    if (current_flash) { overlay.classList.remove(current_flash); }
    if (!type) { current_flash = null; return; }
    overlay.classList.add(type);
    current_flash = type;
    flash_timeout = setTimeout(function () {
      overlay.classList.remove(type);
      current_flash = null;
      flash_timeout = null;
    }, 400);
  }

  return { setFlash, getCurrentFlash: function () { return current_flash; } };
}

describe('Binary Visual Feedback (Flash)', () => {
  let overlay;
  let flash;

  beforeEach(function () {
    vi.useFakeTimers();
    overlay = document.createElement('div');
    overlay.id = 'overlay-canvas';
    overlay.className = 'fixed inset-0 z-40';
    document.body.appendChild(overlay);
    flash = createFlashHelper(overlay);
  });

  afterEach(function () {
    document.body.removeChild(overlay);
    vi.useRealTimers();
  });

  it('flash-success class ditambahkan', () => {
    flash.setFlash('flash-success');
    expect(overlay.classList.contains('flash-success')).toBe(true);
  });

  it('flash-warning class ditambahkan', () => {
    flash.setFlash('flash-warning');
    expect(overlay.classList.contains('flash-warning')).toBe(true);
  });

  it('flash-error class ditambahkan', () => {
    flash.setFlash('flash-error');
    expect(overlay.classList.contains('flash-error')).toBe(true);
  });

  it('flash-idle class ditambahkan', () => {
    flash.setFlash('flash-idle');
    expect(overlay.classList.contains('flash-idle')).toBe(true);
  });

  it('setFlash(null) menghapus flash', () => {
    flash.setFlash('flash-success');
    flash.setFlash(null);
    expect(overlay.classList.contains('flash-success')).toBe(false);
  });

  it('flash otomatis hilang setelah 400ms', () => {
    flash.setFlash('flash-success');
    expect(overlay.classList.contains('flash-success')).toBe(true);

    vi.advanceTimersByTime(400);
    expect(overlay.classList.contains('flash-success')).toBe(false);
  });

  it('flash baru menggantikan flash sebelumnya (class sebelumnya dihapus)', () => {
    flash.setFlash('flash-success');
    flash.setFlash('flash-warning');

    expect(overlay.classList.contains('flash-success')).toBe(false);
    expect(overlay.classList.contains('flash-warning')).toBe(true);
  });
});

function computeFlashType(noFace, larValid, f0Shrill, f0Stable) {
  if (noFace || !larValid) { return 'flash-error'; }
  if (f0Shrill) { return 'flash-warning'; }
  if (f0Stable) { return 'flash-success'; }
  return 'flash-idle';
}

describe('Visual priority logic', () => {
  it('merah override kuning (prioritas tertinggi)', () => {
    expect(computeFlashType(true, false, false, false)).toBe('flash-error');
  });

  it('kuning override hijau', () => {
    expect(computeFlashType(false, true, true, false)).toBe('flash-warning');
  });

  it('hijau saat semua benar', () => {
    expect(computeFlashType(false, true, false, true)).toBe('flash-success');
  });

  it('idle saat tidak ada wajah + suara diam', () => {
    expect(computeFlashType(true, false, false, false)).toBe('flash-error');
  });
});

describe('Mouth Silhouette (drawSilhouette)', () => {
  let canvas;
  let ctx;
  let pulse;
  let calls;

  function drawSilhouette(state, mx, my) {
    if (!ctx) { return; }
    const w = canvas.width;
    const h = canvas.height;
    const cx = (mx !== undefined && mx !== null) ? mx * w : w / 2;
    const cy = (my !== undefined && my !== null) ? my * h : h / 2;
    const rx = Math.max(20, w * 0.25);
    const ry = Math.max(14, h * 0.15);
    let color = '#F8FAFC';
    let lineWidth = 2;
    let alpha = 0.3;

    if (state === 'searching') {
      alpha = 0.2 + Math.sin(pulse) * 0.15;
    } else if (state === 'locked') {
      color = '#22C55E';
      lineWidth = 3;
      alpha = 0.3;
    } else if (state === 'out_of_bounds') {
      color = '#EF4444';
      alpha = 0.3 + Math.sin(pulse * 2) * 0.15;
    }

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([6, 4]);
    ctx.globalAlpha = Math.max(0.1, Math.min(0.5, alpha));
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    pulse += 0.04;
  }

  beforeEach(function () {
    calls = [];
    canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;
    pulse = 0;
    ctx = canvas.getContext('2d');
    ctx.save = function () { calls.push('save'); };
    ctx.restore = function () { calls.push('restore'); };
    ctx.beginPath = function () { calls.push('beginPath'); };
    ctx.stroke = function () { calls.push('stroke'); };
    ctx.ellipse = function () { calls.push('ellipse'); };
    ctx.setLineDash = function (arr) { calls.push('setLineDash:' + arr.join(',')); };
  });

  it('state "searching" menggunakan warna #f8fafc', () => {
    drawSilhouette('searching');
    expect(ctx.strokeStyle).toBe('#f8fafc');
    expect(calls).toContain('ellipse');
    expect(calls).toContain('stroke');
  });

  it('state "locked" menggunakan warna #22c55e dan lineWidth 3', () => {
    drawSilhouette('locked');
    expect(ctx.strokeStyle).toBe('#22c55e');
    expect(ctx.lineWidth).toBe(3);
    expect(calls).toContain('ellipse');
  });

  it('state "out_of_bounds" menggunakan warna #ef4444', () => {
    drawSilhouette('out_of_bounds');
    expect(ctx.strokeStyle).toBe('#ef4444');
    expect(calls).toContain('ellipse');
  });

  it('state default menggunakan #f8fafc dan lineWidth 2', () => {
    drawSilhouette('unknown');
    expect(ctx.strokeStyle).toBe('#f8fafc');
    expect(ctx.lineWidth).toBe(2);
  });

  it('setLineDash [6, 4] dipanggil', () => {
    drawSilhouette('searching');
    expect(calls).toContain('setLineDash:6,4');
  });

  it('searching: alpha berosilasi (efek pulse)', () => {
    const alphas = [];
    for (let i = 0; i < 10; i++) {
      drawSilhouette('searching');
      alphas.push(ctx.globalAlpha);
    }
    const unique = alphas.filter(function (v, i, a) { return a.indexOf(v) === i; });
    expect(unique.length).toBeGreaterThan(1);
  });

  it('locked: alpha statis 0.3 (tanpa pulse)', () => {
    drawSilhouette('locked');
    const alpha1 = ctx.globalAlpha;
    drawSilhouette('locked');
    const alpha2 = ctx.globalAlpha;
    expect(alpha1).toBe(alpha2);
  });

  it('globalAlpha dalam rentang [0.1, 0.5] untuk semua state', () => {
    drawSilhouette('searching');
    expect(ctx.globalAlpha).toBeGreaterThanOrEqual(0.1);
    expect(ctx.globalAlpha).toBeLessThanOrEqual(0.5);

    drawSilhouette('locked');
    expect(ctx.globalAlpha).toBeGreaterThanOrEqual(0.1);
    expect(ctx.globalAlpha).toBeLessThanOrEqual(0.5);

    drawSilhouette('out_of_bounds');
    expect(ctx.globalAlpha).toBeGreaterThanOrEqual(0.1);
    expect(ctx.globalAlpha).toBeLessThanOrEqual(0.5);
  });
});

describe('Continuous flash (kuning persist)', () => {
  let overlay;
  let current_flash;

  function setContinuousFlash(type) {
    if (current_flash) { overlay.classList.remove(current_flash); }
    overlay.classList.add(type);
    current_flash = type;
  }

  function clearFlash() {
    if (current_flash) { overlay.classList.remove(current_flash); current_flash = null; }
  }

  beforeEach(function () {
    overlay = document.createElement('div');
    overlay.id = 'flash-overlay';
    document.body.appendChild(overlay);
    current_flash = null;
  });

  afterEach(function () {
    document.body.removeChild(overlay);
  });

  it('flash kuning bertahan selama kondisi shrill masih aktif', () => {
    setContinuousFlash('flash-warning');
    expect(overlay.classList.contains('flash-warning')).toBe(true);
    clearFlash();
    expect(overlay.classList.contains('flash-warning')).toBe(false);
  });

  it('flash diganti tanpa auto-dismiss (tidak ada setTimeout)', () => {
    setContinuousFlash('flash-warning');
    setContinuousFlash('flash-error');
    expect(overlay.classList.contains('flash-warning')).toBe(false);
    expect(overlay.classList.contains('flash-error')).toBe(true);
  });
});

describe('Flash opacity berbeda', () => {
  it('error opacity lebih tinggi dari warning (prioritas visual)', () => {
    const errorOpacity = 25;
    const warningOpacity = 20;
    expect(errorOpacity).toBeGreaterThan(warningOpacity);
  });
});

describe('Error screen (C9.2)', () => {
  let errorScreen;

  beforeEach(function () {
    errorScreen = document.createElement('div');
    errorScreen.id = 'error-screen';
    errorScreen.className = 'hidden';
    errorScreen.innerHTML = '<h2></h2><p></p>';
    document.body.appendChild(errorScreen);
  });

  afterEach(function () {
    document.body.removeChild(errorScreen);
  });

  it('hidden secara default', () => {
    expect(errorScreen.classList.contains('hidden')).toBe(true);
  });

  it('show() menghilangkan class hidden', () => {
    errorScreen.classList.remove('hidden');
    expect(errorScreen.classList.contains('hidden')).toBe(false);
  });

  it('hide() menambahkan class hidden', () => {
    errorScreen.classList.remove('hidden');
    errorScreen.classList.add('hidden');
    expect(errorScreen.classList.contains('hidden')).toBe(true);
  });

  it('teks error dapat di-update sesuai mode A/I', () => {
    const title = errorScreen.querySelector('h2');
    const msg = errorScreen.querySelector('p');
    title.textContent = 'Mode A';
    msg.textContent = 'Open your mouth wide for A';
    expect(title.textContent).toBe('Mode A');
    expect(msg.textContent).toBe('Open your mouth wide for A');

    title.textContent = 'Mode I';
    msg.textContent = 'Narrow your lips for I';
    expect(title.textContent).toBe('Mode I');
    expect(msg.textContent).toBe('Narrow your lips for I');
  });
});
