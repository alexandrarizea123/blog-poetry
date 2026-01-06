import { Route, Routes } from "react-router-dom";
import { Galerie } from "./pages/Galerie";
import { Home } from "./pages/Home";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/galerie" element={<Galerie />} />
    </Routes>
  );
}
