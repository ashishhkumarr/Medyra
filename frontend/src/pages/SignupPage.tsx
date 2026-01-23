import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/FormField";
import { requestSignupOtp, signupBypass, signupRequest, verifySignupOtp } from "../services/auth";
import { useAuthContext } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { BrandLogo } from "../components/BrandLogo";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty: string;
  license_number: string;
  license_state: string;
  license_country: string;
  npi_number: string;
  taxonomy_code: string;
  clinic_name: string;
  clinic_address: string;
  clinic_city: string;
  clinic_state: string;
  clinic_zip: string;
  clinic_country: string;
  password: string;
  confirm_password: string;
  acknowledgeDemo: boolean;
};

const initialState: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  specialty: "",
  license_number: "",
  license_state: "",
  license_country: "",
  npi_number: "",
  taxonomy_code: "",
  clinic_name: "",
  clinic_address: "",
  clinic_city: "",
  clinic_state: "",
  clinic_zip: "",
  clinic_country: "",
  password: "",
  confirm_password: "",
  acknowledgeDemo: false
};

const SignupPage = () => {
  usePageTitle("Sign Up");
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpEnabled = import.meta.env.VITE_ENABLE_EMAIL_OTP === "true";
  // TEMPORARY / REMOVE BEFORE RELEASE.
  const bypassEnabled = import.meta.env.VITE_ENABLE_DEV_AUTH_BYPASS === "true";

  const requiredFields = [
    "first_name",
    "last_name",
    "email",
    "license_number",
    "clinic_name",
    "clinic_address",
    "clinic_city",
    "clinic_state",
    "clinic_zip",
    "clinic_country",
    "password",
    "confirm_password"
  ];

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = event.target;
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setFormState((prev) => ({
      ...prev,
      [target.name]: nextValue
    }) as FormState);
  };

  useEffect(() => {
    if (!otpMessage) return;
    const timer = window.setTimeout(() => setOtpMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [otpMessage]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!otpEnabled && step !== "details") {
      setStep("details");
      setOtp("");
    }
  }, [otpEnabled, step]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!formState[field as keyof FormState]) {
        nextErrors[field] = "Required";
      }
    });
    if (formState.password && formState.password.length < 8) {
      nextErrors.password = "Must be at least 8 characters";
    }
    if (formState.password !== formState.confirm_password) {
      nextErrors.confirm_password = "Passwords must match";
    }
    if (!formState.acknowledgeDemo) {
      nextErrors.acknowledgeDemo = "Required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildSignupPayload = () => {
    const { acknowledgeDemo, ...payload } = formState;
    return payload;
  };

  const getApiErrorMessage = (error: any) => {
    const detail = error?.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first === "string") {
        return first;
      }
      if (typeof first?.msg === "string") {
        return first.msg;
      }
    }
    const rawData = error?.response?.data;
    if (typeof rawData === "string" && rawData.trim().length > 0) {
      return rawData;
    }
    const message = error?.response?.data?.message || error?.response?.data?.error;
    if (typeof message === "string") {
      return message;
    }
    if (!error?.response) {
      return "Unable to reach the server. Please confirm the backend is running.";
    }
    if (error?.response?.status) {
      return `Signup failed with status ${error.response.status}. Check backend logs for details.`;
    }
    return "Unable to complete signup. Please try again.";
  };

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSendingOtp(true);
    try {
      await requestSignupOtp(formState.email);
      setStep("otp");
      setOtpMessage("OTP sent to your email.");
      setResendCooldown(60);
    } catch (error: any) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleDirectSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSendingOtp(true);
    try {
      await signupRequest(buildSignupPayload());
      await login(formState.email, formState.password);
      navigate("/admin");
    } catch (error: any) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    if (otp.length !== 6) {
      setApiError("Enter the 6-digit verification code.");
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifySignupOtp({ ...buildSignupPayload(), otp });
      navigate("/login");
    } catch (error: any) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleBypassSignup = async () => {
    setApiError(null);
    if (!validate()) return;
    setSendingOtp(true);
    try {
      await signupBypass(buildSignupPayload());
      await login(formState.email, formState.password);
      navigate("/admin");
    } catch (error: any) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    // Mobile alignment: avoid double horizontal padding (App main already provides px-4).
    <div className="relative flex w-full min-h-screen items-center justify-center overflow-hidden px-0 py-10 sm:min-h-[70vh]">
      <div className="pointer-events-none absolute left-10 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-secondary/40 to-surface/60 blur-2xl" />
      <div className="pointer-events-none absolute right-10 top-16 h-24 w-24 rounded-full bg-gradient-to-br from-primary/40 to-surface/60 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-12 h-28 w-28 rounded-full bg-gradient-to-br from-warning-soft/70 to-surface/60 blur-2xl" />
      <div className="relative z-10 mx-auto w-full max-w-[520px] space-y-6 rounded-[36px] border border-border/60 bg-surface/75 p-6 shadow-card backdrop-blur-xl animate-fadeUp sm:max-w-6xl">
        <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex justify-center sm:justify-start">
              <BrandLogo className="h-14 w-14 opacity-95" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Clinic onboarding</p>
            <h1 className="mt-1 text-3xl font-semibold text-text">Create your Medyra account</h1>
            <p className="text-sm text-text-muted">
              Doctors and clinic admins can self-serve access. Patients never sign in.
            </p>
          </div>
          <div className="text-sm text-text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <form
          onSubmit={
            otpEnabled
              ? step === "details"
                ? handleSendOtp
                : handleVerifyOtp
              : handleDirectSignup
          }
          className="space-y-6"
        >
          {step === "details" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="First name"
                  name="first_name"
                  value={formState.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                />
                <InputField
                  label="Last name"
                  name="last_name"
                  value={formState.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                />
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <InputField
                  label="Phone (optional)"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Specialty (optional)"
                  name="specialty"
                  value={formState.specialty}
                  onChange={handleChange}
                  hint="e.g., Cardiology, Pediatrics"
                />
                <InputField
                  label="NPI number (optional)"
                  name="npi_number"
                  value={formState.npi_number}
                  onChange={handleChange}
                />
                <InputField
                  label="Taxonomy code (optional)"
                  name="taxonomy_code"
                  value={formState.taxonomy_code}
                  onChange={handleChange}
                  hint="Provider classification code"
                />
                <InputField
                  label="Medical license number"
                  name="license_number"
                  value={formState.license_number}
                  onChange={handleChange}
                  error={errors.license_number}
                />
                <InputField
                  label="License state (optional)"
                  name="license_state"
                  value={formState.license_state}
                  onChange={handleChange}
                />
                <InputField
                  label="License country (optional)"
                  name="license_country"
                  value={formState.license_country}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Clinic or practice name"
                  name="clinic_name"
                  value={formState.clinic_name}
                  onChange={handleChange}
                  error={errors.clinic_name}
                />
                <InputField
                  label="Clinic street address"
                  name="clinic_address"
                  value={formState.clinic_address}
                  onChange={handleChange}
                  error={errors.clinic_address}
                />
                <InputField
                  label="City"
                  name="clinic_city"
                  value={formState.clinic_city}
                  onChange={handleChange}
                  error={errors.clinic_city}
                />
                <InputField
                  label="State/Province"
                  name="clinic_state"
                  value={formState.clinic_state}
                  onChange={handleChange}
                  error={errors.clinic_state}
                />
                <InputField
                  label="Postal code"
                  name="clinic_zip"
                  value={formState.clinic_zip}
                  onChange={handleChange}
                  error={errors.clinic_zip}
                />
                <InputField
                  label="Country"
                  name="clinic_country"
                  value={formState.clinic_country}
                  onChange={handleChange}
                  error={errors.clinic_country}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={formState.password}
                  onChange={handleChange}
                  error={errors.password}
                  hint="At least 8 characters."
                />
                <InputField
                  label="Confirm password"
                  type="password"
                  name="confirm_password"
                  autoComplete="new-password"
                  value={formState.confirm_password}
                  onChange={handleChange}
                  error={errors.confirm_password}
                />
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/70 p-4 shadow-sm backdrop-blur">
                <label className="flex items-start gap-3 text-sm text-text">
                  <input
                    type="checkbox"
                    name="acknowledgeDemo"
                    checked={formState.acknowledgeDemo}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-border/60 bg-surface/70 text-primary focus:ring-primary"
                  />
                  <span>
                    I understand this is a demo and I will not enter real patient data.
                  </span>
                </label>
                {errors.acknowledgeDemo && (
                  <p className="mt-2 text-xs text-danger">{errors.acknowledgeDemo}</p>
                )}
              </div>
            </>
          )}

          {step === "otp" && otpEnabled && (
            <div className="space-y-4 rounded-2xl border border-border/60 bg-surface/70 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">Verify your email</p>
                  <p className="text-xs text-text-muted">
                    Enter the 6-digit code sent to {formState.email}.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("details")}
                >
                  Edit details
                </Button>
              </div>
              <InputField
                label="Verification code"
                name="otp"
                value={otp}
                onChange={(event) => {
                  const next = event.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(next);
                }}
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
                <span>
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't receive a code?"}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={resendCooldown > 0 || sendingOtp}
                  onClick={async () => {
                    setApiError(null);
                    setSendingOtp(true);
                    try {
                      await requestSignupOtp(formState.email);
                      setOtpMessage("OTP resent to your email.");
                      setResendCooldown(60);
                    } catch (error: any) {
                      setApiError(getApiErrorMessage(error));
                    } finally {
                      setSendingOtp(false);
                    }
                  }}
                >
                  Resend code
                </Button>
              </div>
            </div>
          )}

          {otpMessage && (
            <div className="rounded-2xl border border-success/30 bg-success-soft/80 px-4 py-3 text-sm text-success shadow-sm">
              {otpMessage}
            </div>
          )}

          {apiError && (
            <div className="rounded-2xl border border-danger/40 bg-danger-soft/80 px-4 py-3 text-sm text-danger shadow-sm">
              {apiError}
            </div>
          )}

          {step === "details" ? (
            <div className="space-y-3">
              <Button type="submit" size="lg" className="w-full" isLoading={sendingOtp}>
                {otpEnabled
                  ? sendingOtp
                    ? "Sending code..."
                    : "Send OTP"
                  : sendingOtp
                    ? "Creating account..."
                    : "Create account"}
              </Button>
              {!otpEnabled && (
                <p className="text-center text-xs text-text-muted">
                  Email verification is temporarily disabled for demo purposes.
                </p>
              )}
              {bypassEnabled && otpEnabled && (
                <div className="space-y-2 text-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={handleBypassSignup}
                    disabled={sendingOtp}
                  >
                    Sign up without OTP
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={verifyingOtp}
              disabled={otp.length !== 6 || verifyingOtp}
            >
              {verifyingOtp ? "Verifying..." : "Verify & Create Account"}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
