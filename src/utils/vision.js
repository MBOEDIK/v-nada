import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const FACEMESH_LIPS = {
  top: 13,
  bottom: 14,
  left: 78,
  right: 308,
};

const TARGET_FPS = 15;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

let lastFrameTime = 0;

function throttleFrame(timestamp) {
  if (timestamp - lastFrameTime < FRAME_INTERVAL) return false;
  lastFrameTime = timestamp;
  return true;
}

export function computeEuclideanDistance(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2);
}

export function computeLipAspectRatio(landmarks) {
  const pTop = landmarks[FACEMESH_LIPS.top];
  const pBottom = landmarks[FACEMESH_LIPS.bottom];
  const pLeft = landmarks[FACEMESH_LIPS.left];
  const pRight = landmarks[FACEMESH_LIPS.right];

  const vertical = computeEuclideanDistance(pTop, pBottom);
  const horizontal = computeEuclideanDistance(pLeft, pRight);

  if (horizontal === 0) return 0;
  return vertical / horizontal;
}

export function initCamera(videoElement, onResults) {
  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults((results) => {
    const now = performance.now();
    if (!throttleFrame(now)) return;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      onResults(results.multiFaceLandmarks[0]);
    }
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 480,
    height: 480,
  });

  return camera;
}

export { FACEMESH_LIPS };
