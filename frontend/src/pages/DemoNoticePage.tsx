import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const DemoNoticePage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card className="border border-warning/40 bg-warning-soft/40 p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-warning">
          Demo Notice
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-text">
          This environment is for demonstration only.
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          MediTrack is running in demo mode. Please do not enter real patient
          data, PHI, or sensitive information. Use synthetic names and test
          contact details only.
        </p>
        <ul className="mt-5 grid gap-2 text-sm text-text-muted">
          <li>• Demo seed data is synthetic and safe for walkthroughs.</li>
          <li>• Email notifications are logged unless SMTP is enabled.</li>
          <li>• Reset the database between demos to clear sample records.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button variant="secondary" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DemoNoticePage;
