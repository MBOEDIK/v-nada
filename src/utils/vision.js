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
  if (timestamp - lastFrameTime < FRAME_INTERVAL) {return false;}
  lastFrameTime = timestamp;
  return true;
}

export function computeEuclideanDistance(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2);
}

export function extractLipLandmarks(landmarks) {
  if (!landmarks) {return null;}
  return {
    top: landmarks[FACEMESH_LIPS.top],
    bottom: landmarks[FACEMESH_LIPS.bottom],
    left: landmarks[FACEMESH_LIPS.left],
    right: landmarks[FACEMESH_LIPS.right],
  };
}

export function computeLipAspectRatio(lipLandmarks) {
  const { top, bottom, left, right } = lipLandmarks;
  const vertical = computeEuclideanDistance(top, bottom);
  const horizontal = computeEuclideanDistance(left, right);

  if (horizontal === 0) {return 0;}
  return vertical / horizontal;
}

export function initCamera(videoElement, onResults, onError) {
  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      `/mediapipe/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults((results) => {
    const now = performance.now();
    if (!throttleFrame(now)) {return;}

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const lips = extractLipLandmarks(results.multiFaceLandmarks[0]);
      if (lips) {onResults(lips);}
    }
  });

  function makeCamera(width, height) {
    return new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width,
      height,
    });
  }

  let camera;
  try {
    camera = makeCamera(480, 480);
  } catch (err) {
    if (onError) onError(err);
    return null;
  }

  const origStart = camera.start.bind(camera);
  camera.start = async () => {
    try {
      await origStart();
    } catch (err) {
      if (err.name === 'OverconstrainedError' || err.name === 'NotSupportedError') {
        try {
          const fallbackCam = makeCamera(360, 360);
          await fallbackCam.start();
          return;
        } catch (fallbackErr) {
          if (onError) onError(fallbackErr);
          return;
        }
      }
      if (onError) onError(err);
    }
  };

  return camera;
}

export { FACEMESH_LIPS };
