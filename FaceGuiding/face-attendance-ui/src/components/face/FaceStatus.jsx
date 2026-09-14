export default function FaceStatus({
  status,
  error,
  registration = false,
}) {
  const success =
    !error &&
    status?.includes("thành công");

  const hiddenStatus = [
    "Khuôn mặt hợp lệ - Bấm chụp",
    "Không tìm thấy khuôn mặt",
    "Không thể mở camera",
  ].includes(status);

  if (hiddenStatus && !error) {
    return null;
  }

  return (
    <div className="
      flex
      justify-center
      px-4
    ">
      <div
        className={`
        max-w-[320px]
        rounded-full
        border
        px-[18px]
        py-2.5
        text-center
        text-base
        font-bold
        leading-[1.4]
        backdrop-blur
        shadow-lg
        whitespace-normal
        break-words

        ${
          error
            ? registration
              ? "border-red-400/80 bg-black/80 text-red-300"
              : "bg-red-500/90 text-white"
            : success
              ? "border-emerald-400/80 bg-black/80 text-emerald-300"
              : "border-black/10 bg-white/95 text-black"
        }
      `}
      >
        {error || status}
      </div>
    </div>
  );
}
