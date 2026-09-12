import { useEffect, useRef, useState } from "react";
import { FACE_CONFIG } from "../utils/constants";

export function useFaceDetection(videoRef, enabled) {
  const detectorRef = useRef(null);
  const animationRef = useRef(null);

  const [detections, setDetections] = useState([]);

  useEffect(() => {
    if (!enabled || !videoRef.current) {
      return;
    }

    let cancelled = false;

    const detector =  new window.FaceDetection({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    detector.setOptions({
      model: "short",
      minDetectionConfidence:
        FACE_CONFIG.minDetectionConfidence,
    });

    detector.onResults((results) => {
      if (cancelled) {
        return;
      }

      setDetections(results.detections || []);
    });

    detectorRef.current = detector;

    const detect = async () => {
      if (cancelled) {
        return;
      }

      const video = videoRef.current;

      if (
        video &&
        video.readyState >= 2 &&
        detectorRef.current
      ) {
        try {
          await detectorRef.current.send({
            image: video,
          });
        } catch (error) {
          console.error(
            "MediaPipe detection error:",
            error
          );
        }
      }

      animationRef.current =
        requestAnimationFrame(detect);
    };

    detect();

    return () => {
      cancelled = true;

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      detector.close();
      detectorRef.current = null;
    };
  }, [videoRef, enabled]);

  return {
    detections,
    faceCount: detections.length,
  };
}