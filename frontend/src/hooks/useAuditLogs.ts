import { useQuery } from "@tanstack/react-query";

import { AuditLogQuery, fetchAuditLogs } from "../services/auditLogs";

export const useAuditLogs = (params: AuditLogQuery) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => fetchAuditLogs(params)
  });
};
