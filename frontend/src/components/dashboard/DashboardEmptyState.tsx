import { Activity, CalendarCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const DashboardEmptyState = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <div className="rounded-full bg-secondary-soft/70 p-3 text-secondary">
        <Activity className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text">No activity yet</h3>
        <p className="text-sm text-text-muted">
          Try seed data or create a sample record to see analytics populate.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate("/patients")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add patient
        </Button>
        <Button variant="secondary" onClick={() => navigate("/appointments/create")}>
          <CalendarCheck className="mr-2 h-4 w-4" />
          Create appointment
        </Button>
      </div>
    </Card>
  );
};
