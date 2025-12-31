import { apiClient } from "./api";

export interface AuditLog {
  id: number;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
}

export interface AuditLogQuery {
  entity_type?: string;
  action?: string;
  entity_id?: number;
  limit?: number;
  offset?: number;
  since?: string;
}

export const fetchAuditLogs = async (
  params: AuditLogQuery
): Promise<AuditLog[]> => {
  const { data } = await apiClient.get<AuditLog[]>("/audit-logs/", { params });
  return data;
};
