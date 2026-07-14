import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

/**
 * MediaPipe FaceMesh landmark indices for lip geometry extraction.
 *   Index 13 → Upper lip center (Top)
 *   Index 14 → Lower lip center (Bottom)
 *   Index 78 → Left mouth corner (Left)
 *   Index 308 → Right mouth corner (Right)
 */
const FACEMESH_LIPS = {
  top: 13,
  bottom: 14,
  left: 78,
  right: 308,
};

/** Target maximum frame rate: 20 FPS → 50ms minimum interval. */
const TARGET_FPS = 20;

/** Minimum elapsed milliseconds between two processed frames. */
const FRAME_INTERVAL = 1000 / TARGET_FPS;

/** Inference latency ceiling (ms). Frames slower than this trigger a one-frame skip. */
const INFERENCE_SLOW_MS = 60;

/** Timestamp (ms) of the last FaceMesh-processed frame. */
let last_frame_time = 0;

/** When true the next onFrame invocation is skipped to relieve pipeline pressure. */
let skip_next_frame = false;

/**
 * Compute 2D Euclidean distance between two landmark points.
 *
 * Mathematical definition (per TECH-01 blueprint):
 *   d(p, q) = sqrt((p_x - q_x)^2 + (p_y - q_y)^2)
 *
 * Only the x/y plane is used — the z (depth) component is intentionally
 * excluded because LAR is a 2D aspect-ratio metric.
 *
 * @param {{ x: number, y: number }} p - First 2D point
 * @param {{ x: number, y: number }} q - Second 2D point
 * @returns {number} Euclidean distance in normalized landmark space
 */
function computeEuclideanDistance(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

/**
 * Compute Lip Aspect Ratio (LAR) from four FaceMesh landmarks.
 *
 *   LAR = d(P_top, P_bottom) / d(P_left, P_right)
 *
 * Interpretation:
 *   - High LAR (e.g. > 0.3) → mouth open vertically → vowel /a/
 *   - Low  LAR (e.g. < 0.2) → mouth spread horizontally → vowel /i/
 *
 * @param {Array} landmarks - FaceMesh multiFaceLandmarks[0] array
 * @returns {number} LAR value (0.0 – ~1.5)
 */
function computeLipAspectRatio(landmarks) {
  const p_top = landmarks[FACEMESH_LIPS.top];
  const p_bottom = landmarks[FACEMESH_LIPS.bottom];
  const p_left = landmarks[FACEMESH_LIPS.left];
  const p_right = landmarks[FACEMESH_LIPS.right];

  const vertical = computeEuclideanDistance(p_top, p_bottom);
  const horizontal = computeEuclideanDistance(p_left, p_right);

  if (horizontal === 0) {
    return 0;
  }
  return vertical / horizontal;
}

/**
 * Render mouth landmarks and lip silhouette onto the overlay canvas.
 *
 * Layers drawn (back to front):
 *   1. Static calibration oval (white, 30 % opacity) — face-alignment guide
 *   2. Dynamic lip outline connecting the 4 key landmarks (green, 60 % opacity)
 *   3. Solid green landmark dots at each lip corner / center
 *
 * @param {HTMLCanvasElement} canvas - The overlay canvas (sized to its CSS layout)
 * @param {Array} landmarks - FaceMesh landmark array (normalized 0-1 coords)
 */
function drawMouthOverlay(canvas, landmarks) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // ── Layer 1: Static calibration oval ──────────────────────────────
  // Ellipse centered on canvas — user aligns mouth inside this guide.
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w * 0.15, h * 0.08, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ── Layer 2 + 3: Dynamic lip shape ────────────────────────────────
  // Map normalized [0, 1] landmark coords → canvas pixel coords.
  const pts = [
    { x: landmarks[FACEMESH_LIPS.top].x * w, y: landmarks[FACEMESH_LIPS.top].y * h },
    { x: landmarks[FACEMESH_LIPS.left].x * w, y: landmarks[FACEMESH_LIPS.left].y * h },
    { x: landmarks[FACEMESH_LIPS.bottom].x * w, y: landmarks[FACEMESH_LIPS.bottom].y * h },
    { x: landmarks[FACEMESH_LIPS.right].x * w, y: landmarks[FACEMESH_LIPS.right].y * h },
  ];

  // Lip silhouette outline (closed quadrilateral)
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Landmark dots
  for (const pt of pts) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#22C55E';
    ctx.fill();
  }
}

/**
 * Try to start the front-facing camera at the given resolution.
 * Returns a started Camera instance or throws on failure.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {Function} onFrame - Per-rAF callback forwarded to Camera
 * @param {number} width  - Desired width  (device px)
 * @param {number} height - Desired height (device px)
 * @returns {Promise<Camera>}
 */
async function tryStartCamera(videoElement, onFrame, width, height) {
  const cam = new Camera(videoElement, { onFrame, width, height });
  await cam.start();
  return cam;
}

/**
 * Start the front camera with automatic resolution fallback.
 * Attempts 480 × 480 first; falls back to 360 × 360 when unsupported.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {Function} onFrame
 * @returns {Promise<Camera>} The successfully started Camera instance
 */
async function createCameraWithFallback(videoElement, onFrame) {
  const resolutions = [
    { width: 480, height: 480 },
    { width: 360, height: 360 },
  ];

  for (const { width, height } of resolutions) {
    try {
      return await tryStartCamera(videoElement, onFrame, width, height);
    } catch (err) {
      console.warn(`Camera ${width}x${height} failed: ${err.message}`);
      // Clean up any partially-assigned stream from the failed attempt
      if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach((t) => t.stop());
        videoElement.srcObject = null;
      }
    }
  }

  throw new Error('No supported camera resolution');
}

/**
 * Initialize the FaceMesh + Camera pipeline.
 *
 * Returns a controller with `start()` / `stop()` methods.
 * Processing is capped at ~20 FPS with dynamic frame-skipping when
 * FaceMesh inference latency exceeds 60 ms.
 *
 * @param {HTMLVideoElement} videoElement - Camera feed <video>
 * @param {Object} callbacks
 * @param {Function}       callbacks.onFaceLandmarks - Invoked with landmarks[] when face detected
 * @param {Function}       callbacks.onNoFace        - Invoked when frame has no detected face
 * @param {HTMLCanvasElement} [callbacks.overlayCanvas] - Canvas for mouth overlay rendering
 * @returns {{ start: () => Promise<void>, stop: () => void }}
 */
function initCamera(videoElement, callbacks) {
  const { onFaceLandmarks, onNoFace, overlayCanvas } = callbacks;

  const face_mesh = new FaceMesh({
    locateFile: (file) => `/mediapipe/${file}`,
  });

  face_mesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  face_mesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      if (overlayCanvas) {
        drawMouthOverlay(overlayCanvas, landmarks);
      }

      if (onFaceLandmarks) {
        onFaceLandmarks(landmarks);
      }
    } else if (onNoFace) {
      onNoFace();
    }
  });

  let camera_instance = null;

  return {
    async start() {
      camera_instance = await createCameraWithFallback(videoElement, async () => {
        const now = performance.now();

        /**
         * FPS Throttle (Time-Debounce)
         * ─────────────────────────────
         * If fewer than FRAME_INTERVAL ms (50 ms ≈ 20 FPS) have elapsed
         * since the last processed frame, skip this invocation entirely.
         * This prevents FaceMesh from queuing unbounded work on high-refresh
         * displays (90 / 120 Hz phones).
         */
        if (now - last_frame_time < FRAME_INTERVAL) {
          return;
        }

        /**
         * Dynamic Frame-Skipping
         * ──────────────────────
         * When the previous face_mesh.send() took >= INFERENCE_SLOW_MS (60 ms)
         * the device is struggling to keep up.  Skipping one frame gives the
         * pipeline breathing room and avoids memory / battery pressure.
         */
        if (skip_next_frame) {
          skip_next_frame = false;
          return;
        }

        const send_start = performance.now();
        await face_mesh.send({ image: videoElement });
        const latency = performance.now() - send_start;

        last_frame_time = now;

        if (latency >= INFERENCE_SLOW_MS) {
          skip_next_frame = true;
        }
      });
    },

    stop() {
      if (camera_instance) {
        camera_instance.stop();
        camera_instance = null;
      }
      last_frame_time = 0;
      skip_next_frame = false;
    },
  };
}

export { FACEMESH_LIPS, computeEuclideanDistance, computeLipAspectRatio, initCamera };
