import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const FACEMESH_LIPS = {
  top: 13,
  bottom: 14,
  left: 78,
  right: 308,
};

const TARGET_FPS = 20;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const INFERENCE_SLOW_MS = 60;

let last_frame_time = 0;
let skip_next_frame = false;

function computeEuclideanDistance(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

function computeLipAspectRatio(landmarks) {
  const p_top = landmarks[FACEMESH_LIPS.top];
  const p_bottom = landmarks[FACEMESH_LIPS.bottom];
  const p_left = landmarks[FACEMESH_LIPS.left];
  const p_right = landmarks[FACEMESH_LIPS.right];
  const vertical = computeEuclideanDistance(p_top, p_bottom);
  const horizontal = computeEuclideanDistance(p_left, p_right);
  if (horizontal === 0) { return 0; }
  return vertical / horizontal;
}

function extractLipLandmarks(landmarks) {
  if (!landmarks) { return null; }
  return {
    top: landmarks[FACEMESH_LIPS.top],
    bottom: landmarks[FACEMESH_LIPS.bottom],
    left: landmarks[FACEMESH_LIPS.left],
    right: landmarks[FACEMESH_LIPS.right],
  };
}

function getMouthMidpoint(landmarks) {
  const pTop = landmarks[FACEMESH_LIPS.top];
  const pBottom = landmarks[FACEMESH_LIPS.bottom];
  const pLeft = landmarks[FACEMESH_LIPS.left];
  const pRight = landmarks[FACEMESH_LIPS.right];
  const cx = (pTop.x + pBottom.x + pLeft.x + pRight.x) / 4;
  const cy = (pTop.y + pBottom.y + pLeft.y + pRight.y) / 4;
  const hDist = computeEuclideanDistance(pLeft, pRight);
  const vDist = computeEuclideanDistance(pTop, pBottom);
  return { cx, cy, rx: hDist / 2 + 0.02, ry: vDist / 2 + 0.02 };
}

async function tryStartCamera(videoElement, onFrame, width, height) {
  const cam = new Camera(videoElement, { onFrame, width, height });
  await cam.start();
  return cam;
}

async function createCameraWithFallback(videoElement, onFrame) {
  const resolutions = [
    { width: 480, height: 480 },
    { width: 360, height: 360 },
  ];
  for (const { width, height } of resolutions) {
    try {
      return await tryStartCamera(videoElement, onFrame, width, height);
    } catch (err) {
      if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach((t) => t.stop());
        videoElement.srcObject = null;
      }
    }
  }
  throw new Error('No supported camera resolution');
}

function initCamera(videoElement, callbacks) {
  const { onFaceLandmarks, onNoFace } = callbacks;

  const face_mesh = new FaceMesh({
    locateFile: (file) => `/mediapipe/${file}`,
  });

  face_mesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    selfieMode: true,
  });

  face_mesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      if (onFaceLandmarks) { onFaceLandmarks(landmarks); }
    } else if (onNoFace) {
      onNoFace();
    }
  });

  let camera_instance = null;

  return {
    async start() {
      camera_instance = await createCameraWithFallback(videoElement, async () => {
        const now = performance.now();
        if (now - last_frame_time < FRAME_INTERVAL) { return; }
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

export { FACEMESH_LIPS, computeEuclideanDistance, computeLipAspectRatio, extractLipLandmarks, getMouthMidpoint, initCamera };
