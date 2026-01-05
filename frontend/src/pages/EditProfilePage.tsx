import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation, useQuery } from "@tanstack/react-query";

import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/FormField";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { fetchCurrentUser, updateCurrentUser } from "../services/users";

type ProfileFormState = {
  first_name: string;
  last_name: string;
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
};

const buildFormState = (data?: {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  specialty?: string | null;
  license_number?: string | null;
  license_state?: string | null;
  license_country?: string | null;
  npi_number?: string | null;
  taxonomy_code?: string | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  clinic_city?: string | null;
  clinic_state?: string | null;
  clinic_zip?: string | null;
  clinic_country?: string | null;
}): ProfileFormState => ({
  first_name: data?.first_name ?? "",
  last_name: data?.last_name ?? "",
  phone: data?.phone ?? "",
  specialty: data?.specialty ?? "",
  license_number: data?.license_number ?? "",
  license_state: data?.license_state ?? "",
  license_country: data?.license_country ?? "",
  npi_number: data?.npi_number ?? "",
  taxonomy_code: data?.taxonomy_code ?? "",
  clinic_name: data?.clinic_name ?? "",
  clinic_address: data?.clinic_address ?? "",
  clinic_city: data?.clinic_city ?? "",
  clinic_state: data?.clinic_state ?? "",
  clinic_zip: data?.clinic_zip ?? "",
  clinic_country: data?.clinic_country ?? ""
});

const EditProfilePage = () => {
  usePageTitle("Profile");
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    initialData: user ?? undefined
  });
  const [formState, setFormState] = useState<ProfileFormState>(buildFormState(data));
  const [baseline, setBaseline] = useState<ProfileFormState>(buildFormState(data));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (updated) => {
      updateUser(updated);
    }
  });

  useEffect(() => {
    if (data) {
      const next = buildFormState(data);
      setFormState(next);
      setBaseline(next);
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Unable to load profile." />;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (formState.phone) {
      const digits = formState.phone.replace(/\D/g, "");
      if (digits.length > 0 && digits.length < 7) {
        errors.phone = "Phone number looks too short.";
      }
    }
    if (formState.npi_number) {
      if (!/^\d{10}$/.test(formState.npi_number)) {
        errors.npi_number = "NPI must be 10 digits.";
      }
    }
    if (formState.taxonomy_code) {
      if (!/^[A-Za-z0-9.]+$/.test(formState.taxonomy_code)) {
        errors.taxonomy_code = "Taxonomy code must be alphanumeric.";
      }
    }
    return errors;
  }, [formState]);

  const changedFields = useMemo(() => {
    const changes: Partial<ProfileFormState> = {};
    (Object.keys(formState) as (keyof ProfileFormState)[]).forEach((key) => {
      if (formState[key] !== baseline[key]) {
        changes[key] = formState[key];
      }
    });
    return changes;
  }, [formState, baseline]);

  const hasChanges = Object.keys(changedFields).length > 0;
  const hasErrors = Object.keys(validationErrors).length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!hasChanges || hasErrors) return;
    try {
      await mutation.mutateAsync(changedFields);
    } catch (submitError: any) {
      const detail = submitError?.response?.data?.detail;
      setSubmitError(
        typeof detail === "string"
          ? detail
          : "Unable to update profile. Please try again."
      );
    }
  };

  return (
    <Card className="animate-fadeUp">
      <SectionHeader
        title="Profile"
        description="Manage clinic and provider details."
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Personal
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="First name"
              name="first_name"
              value={formState.first_name}
              onChange={handleChange}
            />
            <InputField
              label="Last name"
              name="last_name"
              value={formState.last_name}
              onChange={handleChange}
            />
            <InputField
              label="Phone"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              error={validationErrors.phone}
            />
            <InputField
              label="Email"
              name="email"
              value={data?.email ?? ""}
              onChange={() => null}
              disabled
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Clinic
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Clinic name"
              name="clinic_name"
              value={formState.clinic_name}
              onChange={handleChange}
            />
            <InputField
              label="Clinic address"
              name="clinic_address"
              value={formState.clinic_address}
              onChange={handleChange}
            />
            <InputField
              label="City"
              name="clinic_city"
              value={formState.clinic_city}
              onChange={handleChange}
            />
            <InputField
              label="State/Province"
              name="clinic_state"
              value={formState.clinic_state}
              onChange={handleChange}
            />
            <InputField
              label="ZIP/Postal code"
              name="clinic_zip"
              value={formState.clinic_zip}
              onChange={handleChange}
            />
            <InputField
              label="Country"
              name="clinic_country"
              value={formState.clinic_country}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Provider (unverified)
          </h3>
          <p className="text-xs text-text-subtle">
            Provider identifiers are unverified in demo mode.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Specialty"
              name="specialty"
              value={formState.specialty}
              onChange={handleChange}
            />
            <InputField
              label="NPI number"
              name="npi_number"
              value={formState.npi_number}
              onChange={handleChange}
              error={validationErrors.npi_number}
            />
            <InputField
              label="Taxonomy code"
              name="taxonomy_code"
              value={formState.taxonomy_code}
              onChange={handleChange}
              error={validationErrors.taxonomy_code}
            />
            <InputField
              label="License number"
              name="license_number"
              value={formState.license_number}
              onChange={handleChange}
            />
            <InputField
              label="License state"
              name="license_state"
              value={formState.license_state}
              onChange={handleChange}
            />
            <InputField
              label="License country"
              name="license_country"
              value={formState.license_country}
              onChange={handleChange}
            />
          </div>
        </div>

        {submitError && (
          <div className="rounded-2xl border border-danger/40 bg-danger-soft/70 px-4 py-3 text-sm text-danger shadow-sm animate-toastIn">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={!hasChanges || hasErrors || mutation.isPending}
            className="w-full justify-center py-3 sm:w-auto"
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center py-3 sm:w-auto"
            onClick={() => navigate("/change-password")}
          >
            Change Password
          </Button>
        </div>
        {mutation.isSuccess && (
          <p className="text-sm text-success">Profile updated successfully.</p>
        )}
      </form>
    </Card>
  );
};

export default EditProfilePage;
