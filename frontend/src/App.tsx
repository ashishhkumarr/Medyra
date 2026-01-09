import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { DemoBanner } from "./components/DemoBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { PageShell } from "./components/ui/PageShell";
import { useAuth } from "./hooks/useAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogPage from "./pages/AuditLogPage";
import AppointmentListPage from "./pages/AppointmentListPage";
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
    Boolean(user) ||
    ["/login", "/signup", "/demo-notice"].some((path) =>
      location.pathname.startsWith(path)
    );
  return (
    <PageShell>
      {showDemoBanner && <DemoBanner />}
      <Navbar />
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          className:
            "rounded-2xl border border-border/60 bg-surface/90 text-text shadow-card backdrop-blur",
          descriptionClassName: "text-xs text-text-muted"
        }}
      />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={landingElement()} />
          <Route path="/demo-notice" element={<DemoNoticePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AuditLogPage />
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
