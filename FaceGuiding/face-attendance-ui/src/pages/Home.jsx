import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
    ">
      <div className="
        w-full
        max-w-md
        bg-white
        rounded-2xl
        shadow
        p-8
      ">
        <h1 className="
          text-2xl
          font-bold
          mb-6
        ">
          Face Attendance
        </h1>

        <div className="
          flex
          flex-col
          gap-4
        ">
          <Link
            to="/register-face"
            className="
              rounded-xl
              bg-black
              text-white
              px-5
              py-3
              text-center
            "
          >
            Register Face
          </Link>
        </div>
        <div className="
          flex
          flex-col
          gap-4
        ">
          <Link
            to="/check-in"
            className="
              rounded-xl
              bg-black
              text-white
              px-5
              py-3
              text-center
            "
          >
            Check In
          </Link>
        </div>
      </div>
    </div>
  );
}
