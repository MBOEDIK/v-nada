import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const FACEMESH_LIPS = { top: 13, bottom: 14, left: 78, right: 308 };

const TARGET_FPS = 20;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const NO_FACE_TIMEOUT = 1500;

let lastFrameTime = 0;
let faceMeshInstance = null;
let cameraInstance = null;
let lastFaceTime = 0;
let noFacePollId = null;
let onNoFaceCallback = null;
let videoElementRef = null;

function throttleFrame(timestamp) {
  if (timestamp - lastFrameTime < FRAME_INTERVAL) { return false; }
  lastFrameTime = timestamp;
  return true;
}

export function computeEuclideanDistance(p, q) {
  return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

export function computeLipAspectRatio(landmarks) {
  const pTop = landmarks[FACEMESH_LIPS.top];
  const pBottom = landmarks[FACEMESH_LIPS.bottom];
  const pLeft = landmarks[FACEMESH_LIPS.left];
  const pRight = landmarks[FACEMESH_LIPS.right];
  const vertical = computeEuclideanDistance(pTop, pBottom);
  const horizontal = computeEuclideanDistance(pLeft, pRight);
  if (horizontal === 0) { return 0; }
  return vertical / horizontal;
}

function startNoFacePoll() {
  stopNoFacePoll();
  noFacePollId = setInterval(function () {
    if (lastFaceTime > 0 && performance.now() - lastFaceTime > NO_FACE_TIMEOUT) {
      if (onNoFaceCallback) { onNoFaceCallback(); }
    }
  }, 500);
}

function stopNoFacePoll() {
  if (noFacePollId) {
    clearInterval(noFacePollId);
    noFacePollId = null;
  }
}

export function initCamera({ videoElement, onFace, onNoFace } = {}) {
  videoElementRef = videoElement;
  onNoFaceCallback = onNoFace || null;

  const faceMesh = new FaceMesh({
    locateFile: function (file) { return `/mediapipe/${file}`; },
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  faceMeshInstance = faceMesh;

  faceMesh.onResults(function (results) {
    const now = performance.now();
    if (!throttleFrame(now)) { return; }
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      lastFaceTime = performance.now();
      if (onFace) { onFace(results.multiFaceLandmarks[0]); }
    }
  });

  startNoFacePoll();

  const resolutions = [
    { width: 480, height: 480 },
    { width: 360, height: 360 },
  ];
  let currentResIndex = 0;
  let currentCamera = null;

  async function tryStart(resIndex) {
    if (currentCamera) {
      try { currentCamera.stop(); } catch (_) { /* ignore */ }
      currentCamera = null;
    }
    const res = resolutions[resIndex];
    const cam = new Camera(videoElement, {
      onFrame: async function () {
        try {
          await faceMesh.send({ image: videoElement });
        } catch (_) {
          if (onNoFaceCallback) { onNoFaceCallback(); }
        }
      },
      width: res.width,
      height: res.height,
    });
    currentCamera = cam;
    cameraInstance = cam;
    try {
      await cam.start();
    } catch (err) {
      if (resIndex < resolutions.length - 1) {
        return tryStart(resIndex + 1);
      }
      throw err;
    }
  }

  const controller = {
    start: function () { return tryStart(0); },
  };

  return controller;
}

export function stopCamera() {
  stopNoFacePoll();
  if (cameraInstance) {
    try { cameraInstance.stop(); } catch (_) { /* ignore */ }
    cameraInstance = null;
  }
  if (faceMeshInstance) {
    try { faceMeshInstance.close(); } catch (_) { /* ignore */ }
    faceMeshInstance = null;
  }
  if (videoElementRef) {
    try {
      if (videoElementRef.srcObject) {
        videoElementRef.srcObject.getTracks().forEach(function (t) { t.stop(); });
        videoElementRef.srcObject = null;
      }
    } catch (_) { /* ignore */ }
    videoElementRef = null;
  }
  lastFaceTime = 0;
  lastFrameTime = 0;
  onNoFaceCallback = null;
}

export { FACEMESH_LIPS };
