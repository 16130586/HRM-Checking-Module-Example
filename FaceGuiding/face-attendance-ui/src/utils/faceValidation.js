import {
  FACE_CONFIG,
} from "./constants";

export function validateFace(
  detection,
  videoWidth,
  videoHeight,
  expectedPose = "front"
) {
  if (!detection?.boundingBox) {
    return {
      valid: false,
      reason: "NO_FACE",
      message: "Không tìm thấy khuôn mặt",
    };
  }

  const box = detection.boundingBox;

  const faceCenterX =
    (box.xCenter ?? 0) * videoWidth;

  const faceCenterY =
    (box.yCenter ?? 0) * videoHeight;

  const faceWidth =
    (box.width ?? 0) * videoWidth;

  const centerX = videoWidth / 2;
  const centerY = videoHeight / 2;

  const maxOffsetX =
    videoWidth *
    FACE_CONFIG.centerToleranceX;

  const maxOffsetY =
    videoHeight *
    FACE_CONFIG.centerToleranceY;

  const centerValid =
    Math.abs(faceCenterX - centerX) <=
      maxOffsetX &&
    Math.abs(faceCenterY - centerY) <=
      maxOffsetY;

  const minFaceWidth =
    videoWidth *
    FACE_CONFIG.minFaceWidthRatio;

  const maxFaceWidth =
    videoWidth *
    FACE_CONFIG.maxFaceWidthRatio;

  const sizeValid =
    faceWidth >= minFaceWidth &&
    faceWidth <= maxFaceWidth;

  if (!centerValid || !sizeValid) {
    return {
      valid: false,
      reason: "OUTSIDE",
      message:
        "Vui lòng đưa mặt vào giữa khung Oval",
    };
  }

  const pose = getFacePose(detection, box);
  if (!isExpectedPose(pose, expectedPose)) {
    return {
      valid: false,
      reason: "WRONG_POSE",
      message: getPoseMessage(expectedPose),
    };
  }

  return {
    valid: true,
    reason: "VALID",
    message: "Giữ nguyên khuôn mặt...",
  };
}

function getFacePose(detection, box) {
  const keypoints = detection.locationData?.relativeKeypoints;
  if (!keypoints || keypoints.length < 4) {
    return null;
  }

  const [rightEye, leftEye, nose] = keypoints;
  const eyeDistance = Math.abs(leftEye.x - rightEye.x);
  if (!eyeDistance) {
    return null;
  }

  const eyeCenterX = (rightEye.x + leftEye.x) / 2;
  const yaw = (nose.x - eyeCenterX) / eyeDistance;
  const eyeCenterY = (rightEye.y + leftEye.y) / 2;
  const pitch = (nose.y - eyeCenterY) / Math.max(box.height, 0.01);

  return { yaw, pitch };
}

function isExpectedPose(pose, expectedPose) {
  if (!pose) {
    return expectedPose === "front";
  }

  const { yaw, pitch } = pose;
  switch (expectedPose) {
    case "left":
      return yaw < -0.18 && Math.abs(pitch - 0.25) < 0.28;
    case "right":
      return yaw > 0.18 && Math.abs(pitch - 0.25) < 0.28;
    case "up":
      return pitch < 0.14;
    case "down":
      return pitch > 0.36;
    default:
      return Math.abs(yaw) <= 0.18 && pitch >= 0.14 && pitch <= 0.36;
  }
}

function getPoseMessage(expectedPose) {
  switch (expectedPose) {
    case "left":
      return "Hãy quay mặt sang trái";
    case "right":
      return "Hãy quay mặt sang phải";
    case "up":
      return "Hãy ngẩng mặt lên";
    case "down":
      return "Hãy cúi mặt xuống";
    default:
      return "Hãy nhìn thẳng vào camera";
  }
}
