export function captureVideoFrame(video) {
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  context.save();

  context.translate(canvas.width, 0);
  context.scale(-1, 1);

  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  context.restore();

  return canvas;
}

export function canvasToBase64(
  canvas,
  quality = 0.9
) {
  return canvas.toDataURL(
    "image/jpeg",
    quality
  );
}

export function canvasToBlob(
  canvas,
  quality = 0.9
) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      quality
    );
  });
}
