import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { RequirePoet } from "./auth/RequirePoet";
import { RequireReader } from "./auth/RequireReader";
import { Galerie } from "./pages/Galerie";
import { GaleriePoems } from "./pages/GaleriePoems";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
import { ProfilCititor } from "./pages/ProfilCititor";
import { ProfilPoet } from "./pages/ProfilPoet";
import { ScriePoezie } from "./pages/ScriePoezie";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="/galerie" element={<Galerie />} />
        <Route path="/galerie/:galleryId" element={<GaleriePoems />} />
        <Route
          path="/scrie"
          element={
            <RequirePoet>
              <ScriePoezie />
            </RequirePoet>
          }
        />
        <Route
          path="/profil"
          element={
            <RequirePoet>
              <ProfilPoet />
            </RequirePoet>
          }
        />
        <Route
          path="/profil-cititor"
          element={
            <RequireReader>
              <ProfilCititor />
            </RequireReader>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
