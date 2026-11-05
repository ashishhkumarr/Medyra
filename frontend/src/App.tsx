import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { DemoBanner } from "./components/DemoBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import AppTour from "./components/tour/AppTour";
import { PageShell } from "./components/ui/PageShell";
import { IS_DEMO } from "./config/demo";
import { useAuth } from "./hooks/useAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AppointmentListPage from "./pages/AppointmentListPage";
import AboutPage from "./pages/AboutPage";
import CreateAppointmentPage from "./pages/CreateAppointmentPage";
import DemoNoticePage from "./pages/DemoNoticePage";
import EditProfilePage from "./pages/EditProfilePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PatientListPage from "./pages/PatientListPage";
import PatientDetailPage from "./pages/PatientRecordDetailsPage";
import SignupPage from "./pages/SignupPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

const App = () => {
  const { user, hydrated } = useAuth();
  const location = useLocation();
  const landingElement = () => {
    if (!hydrated) return null;
    if (user) return <Navigate to="/admin" replace />;
    return <LandingPage />;
  };
  const showDemoBanner =
    IS_DEMO &&
    (Boolean(user) ||
      ["/login", "/signup", "/demo-notice"].some((path) =>
        location.pathname.startsWith(path)
      ));

  // The marketing landing renders full-bleed (its own nav + theme), outside the app shell.
  if (location.pathname === "/" && !user) {
    if (!hydrated) return null;
    return <LandingPage />;
  }

  return (
    <PageShell>
      {showDemoBanner && <DemoBanner />}
      <Navbar />
      <Toaster
        position="top-right"
        closeButton={false}
        toastOptions={{
          className:
            "rounded-2xl border border-border/60 bg-surface/90 text-text shadow-card backdrop-blur",
          descriptionClassName: "text-xs text-text-muted"
        }}
      />
      <AppTour />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={landingElement()} />
          <Route path="/demo-notice" element={<DemoNoticePage />} />
          <Route
            path="/about"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AppointmentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/create"
            element={
              <ProtectedRoute roles={["admin"]}>
                <CreateAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute roles={["admin"]}>
                <PatientListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute roles={["admin"]}>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute roles={["admin"]}>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </PageShell>
  );
};

export default App;
