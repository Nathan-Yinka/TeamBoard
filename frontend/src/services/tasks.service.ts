import type { PaginatedResponse, TaskDto, TaskPriority, TaskQueryDto, TaskStatus } from '@teamboard/shared';
import { apiClient } from './apiClient';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export const tasksService = {
  list(projectId: string, query?: TaskQueryDto): Promise<PaginatedResponse<TaskDto>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortDir) params.append('sortDir', query.sortDir);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedResponse<TaskDto>>(`/projects/${projectId}/tasks${queryString}`);
  },
  create(projectId: string, payload: CreateTaskRequest): Promise<TaskDto> {
    return apiClient.post<TaskDto, CreateTaskRequest>(`/projects/${projectId}/tasks`, payload);
  },
  update(taskId: string, payload: UpdateTaskRequest): Promise<TaskDto> {
    return apiClient.patch<TaskDto, UpdateTaskRequest>(`/tasks/${taskId}`, payload);
  },
  updateStatus(taskId: string, status: TaskStatus): Promise<TaskDto> {
    return apiClient.patch<TaskDto, { status: TaskStatus }>(`/tasks/${taskId}/status`, { status });
  },
  delete(taskId: string): Promise<TaskDto> {
    return apiClient.delete<TaskDto>(`/tasks/${taskId}`);
  }
};
