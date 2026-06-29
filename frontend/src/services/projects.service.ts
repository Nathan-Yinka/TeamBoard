import type { PaginatedResponse, ProjectDto, ProjectQueryDto } from '@teamboard/shared';
import { apiClient } from './apiClient';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  dueDate: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  dueDate?: string;
}

export const projectsService = {
  list(query?: ProjectQueryDto): Promise<PaginatedResponse<ProjectDto>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortDir) params.append('sortDir', query.sortDir);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedResponse<ProjectDto>>(`/projects${queryString}`);
  },
  create(payload: CreateProjectRequest): Promise<ProjectDto> {
    return apiClient.post<ProjectDto, CreateProjectRequest>('/projects', payload);
  },
  update(projectId: string, payload: UpdateProjectRequest): Promise<ProjectDto> {
    return apiClient.patch<ProjectDto, UpdateProjectRequest>(`/projects/${projectId}`, payload);
  },
  delete(projectId: string): Promise<ProjectDto> {
    return apiClient.delete<ProjectDto>(`/projects/${projectId}`);
  }
};
