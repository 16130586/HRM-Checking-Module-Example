import FaceScanner from "../components/face/FaceScanner";

export default function CheckIn() {
  return (
    <div>
      <FaceScanner
        mode="check-in"
      />
    </div>
  );
}
