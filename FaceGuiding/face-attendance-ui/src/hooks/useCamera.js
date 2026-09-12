import {
  useEffect,
  useRef,
  useState,
} from "react";


export function useCamera() {
  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const [
    isReady,
    setIsReady,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    let cancelled = false;


    async function startCamera() {
      try {
        setError("");
        setIsReady(false);


        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            "Browser không hỗ trợ camera."
          );
        }


        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode: "user",

                width: {
                  ideal: 1280,
                },

                height: {
                  ideal: 720,
                },
              },

              audio: false,
            }
          );


        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }


        streamRef.current =
          stream;


        const video =
          videoRef.current;


        if (!video) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }


        video.srcObject =
          stream;


        await video.play();


        if (!cancelled) {
          setIsReady(true);
        }

      } catch (err) {
        console.error(
          "Camera error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Không thể mở camera."
          );
        }
      }
    }


    startCamera();


    return () => {
      cancelled = true;


      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current =
          null;
      }
    };

  }, []);


  return {
    videoRef,
    isReady,
    error,
  };
}