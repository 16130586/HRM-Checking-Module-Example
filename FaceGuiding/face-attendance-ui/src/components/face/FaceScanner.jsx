import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const [reviewIndex, setReviewIndex] =
    useState(0);

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
    setReviewIndex(0);
    setError("");
    setStatus(
      mode === "register"
        ? "Xem lại ảnh trước khi xác nhận"
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

    if (
      mode === "register" &&
      capturedImages.length > 0
    ) {
      setCapturedImages((images) =>
        images.slice(0, reviewIndex)
      );
      setRegistrationStep(reviewIndex);
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

  const reviewImages =
    mode === "register"
      ? [...capturedImages, capturedImage]
      : [capturedImage];

  const selectedReviewImage =
    reviewImages[reviewIndex] || capturedImage;

  const registrationGuidance = [
    "Khuôn mặt hợp lệ - Bấm chụp",
    "Không tìm thấy khuôn mặt",
    "Không thể mở camera",
  ].includes(status)
    ? REGISTRATION_POSES[registrationStep].instruction
    : error || status;

  const checkInGuidance =
    faceValid
      ? "Giữ nguyên khuôn mặt và bấm chụp"
      : error?.includes("xa Oval")
        ? "Đưa mặt lại gần camera"
        : error?.includes("sát Oval")
          ? "Lùi mặt ra xa camera"
          : "Đưa khuôn mặt vào giữa Oval";

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

      const employeeCode =
        result?.userCode ||
        result?.UserCode ||
        "";
      const employeeName =
        result?.fullName ||
        result?.FullName ||
        "nhân viên";

      setStatus(
        mode === "register"
          ? "Đăng ký thành công!"
          : `Check-in thành công! Welcome nhân viên: ${employeeCode} ${employeeName}`
      );

      setError("");

      onSuccess?.(result);

      window.setTimeout(() => {
        navigate("/");
      }, mode === "register" ? 1000 : 3000);
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
      <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black">
        {mode === "register" && (
          <div className="pointer-events-none absolute left-4 right-4 top-24 z-50 text-center text-white">
            <div className="text-sm opacity-85">
              Bước {registrationStep + 1} / {REGISTRATION_POSES.length}
            </div>
            <strong className="mt-1 block text-xl">
              Chụp ảnh góc mặt: {REGISTRATION_POSES[registrationStep].label}
            </strong>
            <div className="mt-1 text-base">
              Hướng dẫn: {registrationGuidance}
            </div>
          </div>
        )}

        {mode !== "register" && (
          <div className="pointer-events-none absolute left-4 right-4 top-24 z-50 text-center text-lg font-bold text-white">
            {checkInGuidance}
          </div>
        )}

        {/* Camera */}
        <CameraView
          videoRef={videoRef}
        />

        {/* Dark overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/20" />

        {/* Face oval */}
        <div className="pointer-events-none absolute inset-0 z-20">
          <FaceOverlay
            valid={faceValid}
            spotlight
          />
        </div>

        {/* Capture button */}
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[9999] flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={
              !faceValid ||
              processing
            }
            aria-label="Chụp ảnh"
            className={`pointer-events-auto flex h-[82px] w-[82px] items-center justify-center rounded-full border-4 border-white/90 p-[5px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
              faceValid
                ? "cursor-pointer bg-white opacity-100"
                : "cursor-not-allowed bg-neutral-500 opacity-55"
            }`}
          >
            <span className="block h-[62px] w-[62px] rounded-full border-2 border-neutral-600 bg-white" />
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
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-black">
      {/* Captured image */}
      <img
        src={selectedReviewImage}
        alt="Captured face"
        className="absolute left-1/2 top-1/2 h-[min(68vw,360px)] w-[min(68vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl object-contain shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      />

      {mode === "register" && (
        <>
          <div className="absolute left-4 right-4 top-8 z-50 text-center text-white">
            <strong className="text-xl">Xem lại ảnh đăng ký</strong>
            <div className="mt-1 text-sm opacity-85">
              Bước {reviewIndex + 1} / {REGISTRATION_POSES.length}: {REGISTRATION_POSES[reviewIndex].label}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setReviewIndex((index) => Math.max(0, index - 1))}
            disabled={reviewIndex === 0 || processing}
            aria-label="Xem ảnh trước"
            className={`absolute left-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-0 text-[26px] leading-none text-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.28)] ${
              reviewIndex === 0 ? "cursor-not-allowed opacity-35" : "cursor-pointer opacity-100"
            }`}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setReviewIndex((index) => Math.min(reviewImages.length - 1, index + 1))}
            disabled={reviewIndex === reviewImages.length - 1 || processing}
            aria-label="Xem ảnh sau"
            className={`absolute right-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-0 text-[26px] leading-none text-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.28)] ${
              reviewIndex === reviewImages.length - 1 ? "cursor-not-allowed opacity-35" : "cursor-pointer opacity-100"
            }`}
          >
            ›
          </button>

          <div className="fixed inset-x-4 bottom-28 z-50 flex justify-center gap-2">
            {reviewImages.map((image, index) => (
              <button
                key={`${index}-${image.slice(-12)}`}
                type="button"
                onClick={() => setReviewIndex(index)}
                aria-label={`Xem ảnh bước ${index + 1}`}
                className={`h-[52px] w-[52px] cursor-pointer rounded-lg bg-gray-900 p-0.5 ${
                  index === reviewIndex
                    ? "border-[3px] border-green-500"
                    : "border-2 border-white/70"
                }`}
              >
                <img
                  src={image}
                  alt={`Ảnh bước ${index + 1}`}
                  className="h-full w-full rounded object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}

      <div className={`absolute left-4 right-4 z-50 ${mode === "register" ? "top-[88px]" : "top-6"}`}>
        <FaceStatus
          status={status}
          error={error}
          registration={mode === "register"}
        />
      </div>

      {/* Preview overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/15" />

      {/* Action buttons */}
      <div className="fixed inset-x-0 bottom-8 z-[9999] flex items-center justify-center gap-4 px-5">
        {/* Retake */}
        <button
          type="button"
          onClick={handleRetake}
          disabled={processing}
          className="min-w-[120px] cursor-pointer rounded-full bg-white px-5 py-3.5 text-base font-semibold text-gray-900 shadow-[0_4px_15px_rgba(0,0,0,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
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
          aria-busy={processing}
          className="min-w-[120px] cursor-pointer rounded-full bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing
            ? "Đang lưu..."
            : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}