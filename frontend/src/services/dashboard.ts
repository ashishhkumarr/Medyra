import { apiClient } from "./api";

export interface DashboardAnalytics {
  kpis: {
    totalPatients: number;
    upcomingAppointments7d: number;
    appointmentsToday: number;
    newPatients30d: number;
  };
  trends: {
    appointmentsByDay30d: { date: string; count: number }[];
    newPatientsByWeek12w: { weekStart: string; count: number }[];
  };
  breakdowns: {
    appointmentsByStatus30d: { status: string; count: number }[];
  };
  meta: {
    range: { from: string; to: string };
    generatedAt: string;
  };
}

export const fetchDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const { data } = await apiClient.get<DashboardAnalytics>("/dashboard/analytics");
  return data;
};
