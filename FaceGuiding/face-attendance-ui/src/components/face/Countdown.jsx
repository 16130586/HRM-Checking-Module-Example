export default function Countdown({
  value,
}) {
  if (value === null) {
    return null;
  }

  return (
    <div className="
      absolute
      z-30
      left-1/2
      top-1/2
      -translate-x-1/2
      -translate-y-1/2
      text-white
      text-7xl
      font-bold
      drop-shadow-lg
    ">
      {value}
    </div>
  );
}

