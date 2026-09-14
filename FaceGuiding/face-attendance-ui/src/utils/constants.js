export const API_BASE_URL = "/api";

export const COUNTDOWN_SECONDS = 3;

export const CAMERA_WIDTH = 1280;
export const CAMERA_HEIGHT = 720;

export const FACE_CONFIG = {
    minDetectionConfidence: 0.6,

    poses: {
        front: {
            skipPoseValidation: true,
            minFaceWidthRatio: 0.25,
            maxFaceWidthRatio: 0.55,
            minFaceHeightRatio: 0.25,
            maxFaceHeightRatio: 0.70,
            centerToleranceX: 0.15,
            centerToleranceY: 0.15,
        },
        left: {
            minFaceWidthRatio: 0.17,
            maxFaceWidthRatio: 0.60,
            centerToleranceX: 0.25,
            centerToleranceY: 0.25,
            yawMin: 0.15,
            pitchCenter: 0.25,
            pitchTolerance: 0.32,
        },
        right: {
            minFaceWidthRatio: 0.17,
            maxFaceWidthRatio: 0.60,
            centerToleranceX: 0.25,
            centerToleranceY: 0.25,
            yawMax: -0.15,
            pitchCenter: 0.25,
            pitchTolerance: 0.32,
        },
        up: {
            minFaceWidthRatio: 0.17,
            maxFaceWidthRatio: 0.60,
            centerToleranceX: 0.25,
            centerToleranceY: 0.25,
            pitchMax: 0.14,
        },
        down: {
            minFaceWidthRatio: 0.15,
            maxFaceWidthRatio: 0.65,
            centerToleranceX: 0.28,
            centerToleranceY: 0.28,
            pitchMin: 0.30,
        },
    },
};

export const REGISTRATION_POSES = [
    {
        id: "front",
        label: "Nhìn thẳng",
        instruction: "Nhìn thẳng vào camera",
    },
    {
        id: "left",
        label: "Quay trái",
        instruction: "Từ từ quay mặt sang trái",
    },
    {
        id: "right",
        label: "Quay phải",
        instruction: "Từ từ quay mặt sang phải",
    },
    {
        id: "up",
        label: "Nhìn lên",
        instruction: "Từ từ ngẩng mặt lên",
    },
    {
        id: "down",
        label: "Nhìn xuống",
        instruction: "Từ từ cúi mặt xuống",
    },
];