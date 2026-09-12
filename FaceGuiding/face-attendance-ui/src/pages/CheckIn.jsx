import { useState } from "react";
import FaceScanner from "../components/face/FaceScanner";

export default function CheckIn() {
  const [result, setResult] =
    useState(null);

  return (
    <div>
      <FaceScanner
        mode="check-in"
        onSuccess={setResult}
      />

      {result && (
        <div className="
          absolute
          z-50
          bottom-20
          left-4
          right-4
          bg-white
          rounded-xl
          p-4
        ">
          <pre>
            {JSON.stringify(
              result,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
