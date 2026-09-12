export const API_BASE_URL = "/api";

export const COUNTDOWN_SECONDS = 3;

export const CAMERA_WIDTH = 1280;
export const CAMERA_HEIGHT = 720;

export const FACE_CONFIG = {
    minDetectionConfidence: 0.6,

    minFaceWidthRatio: 0.18,
    maxFaceWidthRatio: 0.55,

    centerToleranceX: 0.20,
    centerToleranceY: 0.20,
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