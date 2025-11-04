import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// 🔹 Lazy import untuk setiap halaman
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CatatanPage = lazy(() => import("./pages/CatatanPage"));
const CatatanDetailPage = lazy(() => import("./pages/CatatanDetailPage"));
const CatatanEditPage = lazy(() => import("./pages/CatatanEditPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    // 🔹 Suspense menangani fallback saat halaman sedang dimuat
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catatan"
          element={
            <ProtectedRoute>
              <CatatanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catatan/:id"
          element={
            <ProtectedRoute>
              <CatatanDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catatan/edit/:id"
          element={
            <ProtectedRoute>
              <CatatanEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
