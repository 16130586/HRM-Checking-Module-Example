export default function FaceStatus({
  status,
  error,
}) {
  return (
    <div className="
      absolute
      z-30
      top-6
      left-0
      right-0
      flex
      justify-center
      px-4
    ">
      <div className={`
        px-5
        py-3
        rounded-full
        backdrop-blur
        text-sm
        text-center

        ${
          error
            ? "bg-red-500/90 text-white"
            : "bg-black/60 text-white"
        }
      `}>
        {error || status}
      </div>
    </div>
  );
}
