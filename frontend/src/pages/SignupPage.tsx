import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/FormField";
import { requestSignupOtp, verifySignupOtp } from "../services/auth";

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
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-surface-subtle via-surface to-secondary-soft/60 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_45%)]" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 rounded-3xl border border-border/40 bg-surface/85 p-6 shadow-card backdrop-blur animate-fadeUp">
        <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Clinic onboarding</p>
            <h1 className="mt-1 text-3xl font-semibold text-text">Create your MediTrack account</h1>
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
          onSubmit={step === "details" ? handleSendOtp : handleVerifyOtp}
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
              <div className="rounded-2xl border border-border/60 bg-surface-subtle p-4">
                <label className="flex items-start gap-3 text-sm text-text">
                  <input
                    type="checkbox"
                    name="acknowledgeDemo"
                    checked={formState.acknowledgeDemo}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
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

          {step === "otp" && (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-subtle p-4">
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
            <div className="rounded-2xl bg-success-soft/80 px-4 py-3 text-sm text-success">
              {otpMessage}
            </div>
          )}

          {apiError && (
            <div className="rounded-2xl bg-danger-soft/80 px-4 py-3 text-sm text-danger">
              {apiError}
            </div>
          )}

          {step === "details" ? (
            <Button type="submit" className="w-full py-3 text-base" isLoading={sendingOtp}>
              {sendingOtp ? "Sending code..." : "Send OTP"}
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full py-3 text-base"
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
