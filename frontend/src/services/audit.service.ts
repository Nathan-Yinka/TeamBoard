import { AuditLogDto, PaginatedResponse } from '@teamboard/shared';
import { apiClient } from './apiClient';

export const auditService = {
  listLogs: async (projectId: string): Promise<PaginatedResponse<AuditLogDto>> => {
    return apiClient.get(`/projects/${projectId}/audit-logs`);
  }
};
