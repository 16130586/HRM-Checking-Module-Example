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
  const poseConfig =
    FACE_CONFIG.poses[expectedPose] ||
    FACE_CONFIG.poses.front;

  const faceCenterX =
    (box.xCenter ?? 0) * videoWidth;

  const faceCenterY =
    (box.yCenter ?? 0) * videoHeight;

  const faceWidth =
    (box.width ?? 0) * videoWidth;

  const faceHeight =
    (box.height ?? 0) * videoHeight;

  const debug = {
    pose: expectedPose,
    centerX: box.xCenter ?? 0,
    centerY: box.yCenter ?? 0,
    width: box.width ?? 0,
    height: box.height ?? 0,
  };

  const centerX = videoWidth / 2;
  const centerY = videoHeight / 2;

  const maxOffsetX =
    videoWidth *
    poseConfig.centerToleranceX;

  const maxOffsetY =
    videoHeight *
    poseConfig.centerToleranceY;

  const centerValid =
    Math.abs(faceCenterX - centerX) <=
      maxOffsetX &&
    Math.abs(faceCenterY - centerY) <=
      maxOffsetY;

  const minFaceWidth =
    videoWidth *
    poseConfig.minFaceWidthRatio;

  const maxFaceWidth =
    videoWidth *
    poseConfig.maxFaceWidthRatio;

  const minFaceHeight =
    videoHeight *
    (poseConfig.minFaceHeightRatio ?? 0);

  const maxFaceHeight =
    videoHeight *
    (poseConfig.maxFaceHeightRatio ?? 1);

  const sizeValid =
    faceWidth >= minFaceWidth &&
    faceWidth <= maxFaceWidth &&
    faceHeight >= minFaceHeight &&
    faceHeight <= maxFaceHeight;

  if (!centerValid || !sizeValid) {
    return {
      valid: false,
      reason: "OUTSIDE",
      message: getFrameGuidance(
        debug,
        centerValid,
        sizeValid,
        poseConfig
      ),
      debug,
    };
  }

  const poseResult = getFacePose(detection, box);
  const pose = poseResult.pose;
  debug.yaw = pose?.yaw ?? null;
  debug.pitch = pose?.pitch ?? null;
  debug.keypointCount = poseResult.keypointCount;
  debug.eyeDistance = poseResult.eyeDistance ?? null;
  debug.poseReason = poseResult.reason;
  if (
    !poseConfig.skipPoseValidation &&
    !isExpectedPose(pose, poseConfig)
  ) {
    return {
      valid: false,
      reason: "WRONG_POSE",
      message: getPoseGuidance(
        expectedPose,
        pose,
        poseConfig
      ),
      debug,
    };
  }

  return {
    valid: true,
    reason: "VALID",
    message: "Giữ nguyên khuôn mặt...",
    debug,
  };
}

function getFrameGuidance(
  debug,
  centerValid,
  sizeValid,
  poseConfig
) {
  if (!centerValid) {
    return "Đưa khuôn mặt vào giữa Oval";
  }

  if (!sizeValid) {
    const tooSmall =
      debug.width < (poseConfig.minFaceWidthRatio ?? 0) ||
      debug.height < (poseConfig.minFaceHeightRatio ?? 0);

    if (tooSmall) {
      return "Khuôn mặt đang xa Oval, hãy đưa mặt lại gần camera";
    }

    return "Khuôn mặt đang sát Oval, hãy lùi mặt ra xa camera";
  }

  return "Giữ khuôn mặt trong Oval";
}

function getPoseGuidance(
  expectedPose,
  pose,
  poseConfig
) {
  if (!pose) {
    return getPoseMessage(expectedPose);
  }

  switch (expectedPose) {
    case "left":
      if (poseConfig.skipYawValidation) {
        return "Giữ mặt trong vùng Oval và điều chỉnh nhẹ lên/xuống";
      }
      return "Quay sang trái thêm một chút nữa";
    case "right":
      return "Quay sang phải thêm một chút nữa";
    case "up":
      return "Ngẩng lên thêm một chút nữa";
    case "down":
      return "Cúi xuống thêm một chút nữa";
    default:
      return "Nhìn thẳng vào camera";
  }
}

function getFacePose(detection, box) {
  const keypointResult = getDetectionKeypoints(detection);
  const keypoints = keypointResult.keypoints;
  if (!keypoints) {
    return {
      pose: null,
      keypointCount: 0,
      reason: `NO_KEYPOINTS_${keypointResult.source}`,
    };
  }

  if (keypoints.length < 3) {
    return {
      pose: null,
      keypointCount: keypoints.length,
      reason: `NEED_3_KEYPOINTS_${keypointResult.source}`,
    };
  }

  const [rightEye, leftEye, nose] = keypoints;
  const eyeDistance = Math.abs(leftEye.x - rightEye.x);
  if (!eyeDistance) {
    return {
      pose: null,
      keypointCount: keypoints.length,
      eyeDistance,
      reason: `EYES_OVERLAP_${keypointResult.source}`,
    };
  }

  const eyeCenterX = (rightEye.x + leftEye.x) / 2;
  const yaw = (nose.x - eyeCenterX) / eyeDistance;
  const eyeCenterY = (rightEye.y + leftEye.y) / 2;
  const pitch = (nose.y - eyeCenterY) / Math.max(box.height, 0.01);

  return {
    pose: { yaw, pitch },
    keypointCount: keypoints.length,
    eyeDistance,
    reason: `OK_${keypointResult.source}`,
  };
}

function getDetectionKeypoints(detection) {
  const candidates = [
    [
      "locationData.relativeKeypoints",
      detection.locationData?.relativeKeypoints,
    ],
    ["relativeKeypoints", detection.relativeKeypoints],
    ["keypoints", detection.keypoints],
    ["landmarks", detection.landmarks],
  ];

  for (const [source, value] of candidates) {
    if (value && typeof value.length === "number") {
      return {
        keypoints: Array.from(value),
        source,
      };
    }
  }

  return {
    keypoints: null,
    source: "UNKNOWN",
  };
}

function isExpectedPose(pose, poseConfig) {
  if (!pose) {
    return false;
  }

  const { yaw, pitch } = pose;
  const yawValid =
    poseConfig.skipYawValidation ||
    ((poseConfig.yawMin === undefined || yaw >= poseConfig.yawMin) &&
      (poseConfig.yawMax === undefined || yaw <= poseConfig.yawMax));
  const pitchMin =
    poseConfig.pitchCenter === undefined
      ? poseConfig.pitchMin
      : poseConfig.pitchCenter - poseConfig.pitchTolerance;
  const pitchMax =
    poseConfig.pitchCenter === undefined
      ? poseConfig.pitchMax
      : poseConfig.pitchCenter + poseConfig.pitchTolerance;
  const pitchValid =
    (pitchMin === undefined || pitch >= pitchMin) &&
    (pitchMax === undefined || pitch <= pitchMax);

  return yawValid && pitchValid;
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
