import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { DemoBanner } from "./components/DemoBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
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
    <div className="min-h-screen">
      {showDemoBanner && <DemoBanner />}
      <Navbar />
      <main className="w-full max-w-none px-6 py-8 sm:px-8 lg:px-12 2xl:px-16">
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
    </div>
  );
};

export default App;
