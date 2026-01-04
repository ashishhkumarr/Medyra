import { useQuery } from "@tanstack/react-query";

import { DashboardAnalytics, fetchDashboardAnalytics } from "../services/dashboard";

export const useDashboardAnalytics = () => {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard", "analytics"],
    queryFn: fetchDashboardAnalytics
  });
};
