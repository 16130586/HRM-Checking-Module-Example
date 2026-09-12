export function cropFaceFromVideo({
  video,
  boundingBox,
  padding = 0.25,
  outputSize = 224,
}) {
  if (!video) {
    throw new Error("Video element is required.");
  }

  if (!boundingBox) {
    throw new Error("Face bounding box is required.");
  }

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (!videoWidth || !videoHeight) {
    throw new Error(
      "Video dimensions are not ready."
    );
  }

  /*
   * MediaPipe legacy FaceDetection:
   *
   * boundingBox:
   * {
   *   xCenter: 0..1,
   *   yCenter: 0..1,
   *   width: 0..1,
   *   height: 0..1
   * }
   */

  const xCenter =
    boundingBox.xCenter * videoWidth;

  const yCenter =
    boundingBox.yCenter * videoHeight;

  let width =
    boundingBox.width * videoWidth;

  let height =
    boundingBox.height * videoHeight;


  /*
   * Convert center-based box
   * to top-left coordinates.
   */
  let x =
    xCenter - width / 2;

  let y =
    yCenter - height / 2;


  /*
   * Add padding.
   */
  const paddingX =
    width * padding;

  const paddingY =
    height * padding;

  x -= paddingX;
  y -= paddingY;

  width += paddingX * 2;
  height += paddingY * 2;


  /*
   * Make the crop square.
   *
   * ArcFace works better when the
   * face crop keeps consistent aspect ratio.
   */
  let size = Math.max(
    width,
    height
  );


  /*
   * Don't make crop larger than video.
   */
  size = Math.min(
    size,
    videoWidth,
    videoHeight
  );


  /*
   * Re-center square crop.
   */
  let cropX =
    x + (width - size) / 2;

  let cropY =
    y + (height - size) / 2;


  /*
   * Clamp to video boundaries.
   */
  cropX = Math.max(
    0,
    Math.min(
      cropX,
      videoWidth - size
    )
  );

  cropY = Math.max(
    0,
    Math.min(
      cropY,
      videoHeight - size
    )
  );


  /*
   * Create output canvas.
   */
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = outputSize;
  canvas.height = outputSize;


  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Cannot create canvas context."
    );
  }


  /*
   * IMPORTANT:
   *
   * Do NOT mirror here.
   *
   * The video may be visually mirrored
   * with CSS, but the actual video frame
   * remains normal.
   */
  ctx.drawImage(
    video,
    cropX,
    cropY,
    size,
    size,
    0,
    0,
    outputSize,
    outputSize
  );


  return canvas;
}