export default function FaceOverlay({
  valid,
}) {
  return (
    <div
      className={`
        absolute
        z-10
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2
        rounded-[50%]
        border-4
        transition-all
        duration-200

        ${
          valid
            ? `
              border-green-400
              shadow-[0_0_35px_rgba(34,197,94,0.8)]
            `
            : `
              border-white
            `
        }
      `}
      style={{
        width: "280px",
        height: "360px",
      }}
    />
  );
}
