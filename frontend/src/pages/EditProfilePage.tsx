import { useEffect, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { fetchCurrentUser, updateCurrentUser } from "../services/users";

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    initialData: user ?? undefined
  });
  const [formState, setFormState] = useState({
    full_name: data?.full_name ?? "",
    phone: data?.phone ?? "",
    password: ""
  });
  const mutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (updated) => {
      updateUser(updated);
    }
  });

  useEffect(() => {
    if (data) {
      setFormState({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        password: ""
      });
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Unable to load profile." />;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutation.mutateAsync({
      full_name: formState.full_name,
      phone: formState.phone,
      password: formState.password || undefined
    });
    setFormState((prev) => ({ ...prev, password: "" }));
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-700">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-600">Full Name</label>
          <input
            name="full_name"
            value={formState.full_name}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Phone</label>
          <input
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Password</label>
          <input
            type="password"
            name="password"
            value={formState.password}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
        {mutation.isSuccess && (
          <p className="text-sm text-green-600">Profile updated.</p>
        )}
      </form>
    </div>
  );
};

export default EditProfilePage;
