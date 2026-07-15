export function drawSilhouette(ctx, width, height, isFaceDetected, mouthData) {
  let centerX, centerY, radiusX, radiusY;

  if (mouthData) {
    centerX = mouthData.cx * width;
    centerY = mouthData.cy * height;
    radiusX = mouthData.rx * width;
    radiusY = mouthData.ry * height;
  } else {
    centerX = width / 2;
    centerY = height / 2;
    radiusX = width * 0.15;
    radiusY = height * 0.10;
  }

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

  if (isFaceDetected) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  } else {
    const pulse = 0.35 + 0.15 * Math.sin(Date.now() / 500);
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.toFixed(2)})`;
  }

  ctx.lineWidth = 2;
  ctx.stroke();
}
