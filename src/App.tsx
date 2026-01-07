import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { RequirePoet } from "./auth/RequirePoet";
import { Galerie } from "./pages/Galerie";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
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
        <Route
          path="/scrie"
          element={
            <RequirePoet>
              <ScriePoezie />
            </RequirePoet>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
