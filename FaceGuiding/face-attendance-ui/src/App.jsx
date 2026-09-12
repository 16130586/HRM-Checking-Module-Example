import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
} from "react-router-dom";

import Home from "./pages/Home";
import CheckIn from "./pages/CheckIn";
import RegisterFace from "./pages/RegisterFace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/check-in"
          element={<CheckIn />}
        />

        <Route
          path="/register-face"
          element={<RegisterFaceRoute />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function RegisterFaceRoute() {
  const { userId } = useParams();

  return (
    <RegisterFace
      userId={Number(userId)}
    />
  );
}