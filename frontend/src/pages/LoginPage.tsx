import { useState } from "react";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { BrandLogo } from "../components/BrandLogo";

const LoginPage = () => {
  usePageTitle("Login");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const state = location.state as { from?: Location } | null;
      const redirectPath = state?.from?.pathname;
      navigate(redirectPath || "/");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Mobile alignment: avoid double horizontal padding (App main already provides px-4).
    <div className="relative flex w-full min-h-screen items-center justify-center overflow-hidden px-0 py-10 sm:min-h-[70vh]">
      <div className="pointer-events-none absolute left-12 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-secondary/40 to-surface/60 blur-2xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-24 w-24 rounded-full bg-gradient-to-br from-primary/40 to-surface/60 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-28 w-28 rounded-full bg-gradient-to-br from-danger-soft/60 to-surface/60 blur-2xl" />
      <div className="relative z-10 mx-auto grid w-full max-w-[460px] gap-10 rounded-[36px] border border-border/60 bg-surface/70 p-6 shadow-card backdrop-blur-xl sm:max-w-6xl sm:p-10 lg:p-12 xl:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-surface/70 p-8 shadow-card backdrop-blur animate-fadeUp">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Clinic Portal</p>
          <h1 className="mt-3 text-3xl font-semibold text-text">Medyra Admin Portal</h1>
          <p className="mt-3 text-base text-text-muted">
            Only clinic staff can access orchestration tools for patient journeys, schedules, and communications.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 p-3 shadow-sm backdrop-blur">
              <div className="rounded-full bg-primary-soft/80 p-2 text-primary">1</div>
              Advanced scheduling intelligence
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 p-3 shadow-sm backdrop-blur">
              <div className="rounded-full bg-primary-soft/80 p-2 text-primary">2</div>
              Unified patient insights
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 p-3 shadow-sm backdrop-blur">
              <div className="rounded-full bg-primary-soft/80 p-2 text-primary">3</div>
              Secure medical-grade access
            </div>
          </div>
        </div>
        <div className="glass-card animate-fadeUp border border-border/60 p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex justify-center">
                <BrandLogo className="h-14 w-14 opacity-95" />
              </div>
              <h2 className="text-2xl font-semibold text-text">Welcome Back</h2>
              <p className="text-sm text-text-muted">Sign in with your clinic credentials.</p>
            </div>
            <InputField
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="clinician@meditrack.com"
            />
            <InputField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              hint="Use the admin credentials from setup documentation."
            />
            {error && (
              <div className="rounded-2xl border border-danger/40 bg-danger-soft/80 px-4 py-3 text-sm text-danger shadow-sm">
                {error}
              </div>
            )}
            <Button type="submit" size="lg" isLoading={loading} className="w-full">
              Sign In Securely
            </Button>
            <p className="text-center text-sm text-text-muted">
              Need an account?{" "}
              <Link to="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
                Create a clinic login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
