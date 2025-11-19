import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-brand">
          MediTrack
        </Link>
        {user ? (
          <nav className="flex items-center gap-4 text-sm font-medium">
            {user.role === "admin" && (
              <>
                <Link to="/admin" className="hover:text-brand">
                  Dashboard
                </Link>
                <Link to="/appointments" className="hover:text-brand">
                  Appointments
                </Link>
                <Link to="/appointments/create" className="hover:text-brand">
                  New Appointment
                </Link>
              </>
            )}
            {user.role === "patient" && (
              <>
                <Link to="/patient" className="hover:text-brand">
                  Dashboard
                </Link>
                <Link to="/my-appointments" className="hover:text-brand">
                  My Appointments
                </Link>
              </>
            )}
            <Link to="/profile/edit" className="hover:text-brand">
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark"
            >
              Logout
            </button>
          </nav>
        ) : (
          <Link
            to="/login"
            className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
