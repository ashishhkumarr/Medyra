interface Props {
  message?: string;
}

export const ErrorState = ({ message }: Props) => (
  <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    {message || "Something went wrong. Please try again."}
  </div>
);
