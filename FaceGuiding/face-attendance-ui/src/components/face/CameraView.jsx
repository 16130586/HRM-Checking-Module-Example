export default function CameraView({
  videoRef,
}) {
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="
        absolute
        inset-0
        w-full
        h-full
        object-cover
        scale-x-[-1]
      "
    />
  );
}
