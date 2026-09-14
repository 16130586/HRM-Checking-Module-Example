export default function FaceOverlay({
  valid,
  spotlight = false,
}) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 z-10 h-[360px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-4 ${
        valid ? "border-green-400" : "border-white"
      } ${
        spotlight
          ? valid
            ? "shadow-[0_0_35px_rgba(34,197,94,0.8),0_0_0_9999px_rgba(5,8,12,0.72)]"
            : "shadow-[0_0_0_9999px_rgba(5,8,12,0.72)]"
          : ""
      }`}
    />
  );
}
