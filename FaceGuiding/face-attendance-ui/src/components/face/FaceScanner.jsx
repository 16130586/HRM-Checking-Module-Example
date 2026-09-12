import { useEffect, useState } from "react";

import CameraView from "./CameraView";
import FaceOverlay from "./FaceOverlay";
import FaceStatus from "./FaceStatus";

import { useCamera } from "../../hooks/useCamera";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { cropFaceFromVideo } from "../../utils/faceCrop";
import { validateFace } from "../../utils/faceValidation";

import {
  canvasToBase64,
} from "../../utils/imageUtils";

import {
  registerFace,
  checkIn,
} from "../../services/attendanceApi";
import { REGISTRATION_POSES } from "../../utils/constants";

/* Detection state is synchronized from the camera callback in this effect. */
/* eslint-disable react-hooks/set-state-in-effect */

export default function FaceScanner({
  mode = "check-in",
  userId = null,
  onSuccess,
}) {
  const {
    videoRef,
    isReady,
    error: cameraError,
  } = useCamera();

  const {
    detections,
    faceCount,
  } = useFaceDetection(
    videoRef,
    isReady
  );

  const [faceValid, setFaceValid] =
    useState(false);

  const [status, setStatus] =
    useState("Đang mở camera...");

  const [error, setError] =
    useState("");

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [capturedImages, setCapturedImages] =
    useState([]);

  const [registrationStep, setRegistrationStep] =
    useState(0);

  const [processing, setProcessing] =
    useState(false);

  function invalidate(message) {
    setFaceValid(false);
    setError(message);
    setStatus(message);
  }

  /*
   * Validate the detected face.
   */
  useEffect(() => {
    // Khi đã chụp thì không cần
    // tiếp tục validate camera.
    if (capturedImage) {
      return;
    }

    if (cameraError) {
      setFaceValid(false);
      setError(cameraError);
      setStatus(
        "Không thể mở camera"
      );
      return;
    }

    if (!isReady) {
      setFaceValid(false);
      setStatus(
        "Đang mở camera..."
      );
      return;
    }

    if (faceCount === 0) {
      invalidate(
        "Không tìm thấy khuôn mặt"
      );
      return;
    }

    if (faceCount > 1) {
      invalidate(
        "Chỉ cho phép 1 người"
      );
      return;
    }

    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    if (
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {
      return;
    }

    const result =
      validateFace(
        detections[0],
        video.videoWidth,
        video.videoHeight,
        mode === "register"
          ? REGISTRATION_POSES[registrationStep].id
          : "front"
      );

    if (!result.valid) {
      invalidate(result.message);
      return;
    }

    setFaceValid(true);
    setError("");
    setStatus(
      "Khuôn mặt hợp lệ - Bấm chụp"
    );
  }, [
    detections,
    faceCount,
    isReady,
    cameraError,
    capturedImage,
    videoRef,
    mode,
    registrationStep,
  ]);

  /*
   * Capture current video frame.
   */
  function handleCapture() {
  if (processing) {
    return;
  }

  if (!faceValid) {
    return;
  }

  const video =
    videoRef.current;

  if (!video) {
    setError(
      "Camera chưa sẵn sàng"
    );
    return;
  }

  if (
    !detections ||
    detections.length !== 1
  ) {
    setError(
      "Không xác định được khuôn mặt"
    );
    return;
  }

  try {
    /*
     * Get the only detected face
     */
    const detection =
      detections[0];

    /*
     * Crop face from current video frame
     *
     * padding 25%:
     * - keeps forehead
     * - keeps chin
     * - keeps some face context
     */
    const canvas =
      cropFaceFromVideo({
        video,

        boundingBox:
          detection.boundingBox,

        padding: 0.25,

        /*
         * ArcFace backend eventually
         * processes to 112x112.
         *
         * Send a higher-quality crop first.
         */
        outputSize: 224,
      });

    /*
     * Convert cropped canvas → Base64
     */
    const base64Image =
      canvasToBase64(
        canvas,
        0.9
      );

    /*
     * This image is now the cropped face.
     */
    if (
      mode === "register" &&
      registrationStep < REGISTRATION_POSES.length - 1
    ) {
      setCapturedImages((images) => [
        ...images,
        base64Image,
      ]);
      setRegistrationStep((step) => step + 1);
      setFaceValid(false);
      setError("");
      setStatus(
        `Đã chụp ${REGISTRATION_POSES[registrationStep].label}. ${REGISTRATION_POSES[registrationStep + 1].instruction}`
      );
      return;
    }

    setCapturedImage(base64Image);
    setError("");
    setStatus(
      mode === "register"
        ? "Đã đủ 5 góc - kiểm tra và xác nhận"
        : "Đã chụp khuôn mặt"
    );

  } catch (err) {
    console.error(
      "Face crop error:",
      err
    );

    setError(
      err?.message ||
        "Không thể crop khuôn mặt"
    );

    setStatus(
      "Chụp ảnh thất bại"
    );
  }
}

  /*
   * Return to camera.
   */
  function handleRetake() {
    if (processing) {
      return;
    }

    setCapturedImage(null);
    setFaceValid(false);
    setError("");
    setStatus(
      mode === "register"
        ? REGISTRATION_POSES[registrationStep].instruction
        : "Đưa khuôn mặt vào khung"
    );
  }

  /*
   * Send captured image to API.
   */
  async function handleConfirm() {
    if (
      !capturedImage ||
      processing
    ) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      let result;

      if (mode === "register") {
        if (!userId) {
          throw new Error(
            "Thiếu userId"
          );
        }

        setStatus(
          "Đang đăng ký khuôn mặt..."
        );

        result =
          await registerFace(userId, [
            ...capturedImages,
            capturedImage,
          ]);
      } else {
        setStatus(
          "Đang nhận diện..."
        );

        result =
          await checkIn(
            capturedImage
          );
      }

      setStatus(
        mode === "register"
          ? "Đăng ký thành công!"
          : "Chấm công thành công!"
      );

      setError("");

      onSuccess?.(result);
    } catch (err) {
      console.error(
        "Face API error:",
        err
      );

      setError(
        err?.message ||
          "Có lỗi xảy ra"
      );

      setStatus(
        "Thất bại"
      );
    } finally {
      setProcessing(false);
    }
  }

  /*
   * -------------------------
   * CAMERA MODE
   * -------------------------
   */
  if (!capturedImage) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100dvh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {mode === "register" && (
          <div
            style={{
              position: "absolute",
              top: "96px",
              left: "16px",
              right: "16px",
              zIndex: 50,
              color: "#fff",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: "14px", opacity: 0.85 }}>
              Bước {registrationStep + 1} / {REGISTRATION_POSES.length}
            </div>
            <strong style={{ fontSize: "20px" }}>
              {REGISTRATION_POSES[registrationStep].instruction}
            </strong>
          </div>
        )}

        {/* Camera */}
        <CameraView
          videoRef={videoRef}
        />

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "rgba(0,0,0,0.20)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* Face oval */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <FaceOverlay
            valid={faceValid}
          />
        </div>

        {/* Status */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "16px",
            right: "16px",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          <FaceStatus
            status={status}
            error={error}
          />
        </div>

        {/* Face count */}
        <div
          style={{
            position: "absolute",
            top: "90px",
            left: 0,
            right: 0,
            zIndex: 50,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding:
                "7px 14px",
              borderRadius: "999px",
              background:
                "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {faceCount} face
            {faceCount !== 1
              ? "s"
              : ""}{" "}
            detected
          </div>
        </div>

        {/* Capture button */}
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "32px",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <button
            type="button"
            onClick={handleCapture}
            disabled={
              !faceValid ||
              processing
            }
            aria-label="Chụp ảnh"
            style={{
              pointerEvents:
                "auto",
              width: "82px",
              height: "82px",
              padding: "5px",
              borderRadius:
                "50%",
              border:
                "4px solid rgba(255,255,255,0.9)",
              background:
                faceValid
                  ? "#fff"
                  : "#777",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor: faceValid
                ? "pointer"
                : "not-allowed",
              opacity: faceValid
                ? 1
                : 0.55,
              transition:
                "transform 0.1s ease",
            }}
          >
            <span
              style={{
                display: "block",
                width: "62px",
                height: "62px",
                borderRadius:
                  "50%",
                background:
                  "#fff",
                border:
                  "2px solid #555",
              }}
            />
          </button>
        </div>
      </div>
    );
  }

  /*
   * -------------------------
   * PREVIEW MODE
   * -------------------------
   */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Captured image */}
      <img
        src={capturedImage}
        alt="Captured face"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Preview overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "rgba(0,0,0,0.15)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Preview status */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "16px",
          right: "16px",
          zIndex: 50,
        }}
      >
        <FaceStatus
          status={status}
          error={error}
        />
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "32px",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          padding:
            "0 20px",
        }}
      >
        {/* Retake */}
        <button
          type="button"
          onClick={handleRetake}
          disabled={processing}
          style={{
            minWidth: "120px",
            padding:
              "14px 20px",
            border: "none",
            borderRadius:
              "999px",
            background: "#fff",
            color: "#111",
            fontSize: "16px",
            fontWeight: 600,
            cursor:
              "pointer",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.4)",
            opacity:
              processing ? 0.5 : 1,
          }}
        >
          Chụp lại
        </button>

        {/* Confirm */}
        <button
          type="button"
          onClick={
            handleConfirm
          }
          disabled={processing}
          style={{
            minWidth: "120px",
            padding:
              "14px 20px",
            border: "none",
            borderRadius:
              "999px",
            background:
              "#2563eb",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor:
              "pointer",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.4)",
            opacity:
              processing ? 0.5 : 1,
          }}
        >
          {processing
            ? "Đang xử lý..."
            : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}