import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AppointmentListPage from "./pages/AppointmentListPage";
import CreateAppointmentPage from "./pages/CreateAppointmentPage";
import EditProfilePage from "./pages/EditProfilePage";
import LoginPage from "./pages/LoginPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import NotFoundPage from "./pages/NotFoundPage";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRecordDetailsPage from "./pages/PatientRecordDetailsPage";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to={user?.role === "admin" ? "/admin" : "/patient"} replace />
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
            path="/patient"
            element={
              <ProtectedRoute roles={["patient"]}>
                <PatientDashboard />
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
            path="/patients/:id"
            element={
              <ProtectedRoute roles={["admin"]}>
                <PatientRecordDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute roles={["patient"]}>
                <MyAppointmentsPage />
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
