import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';

export * from './contracts/auth.contract';
export * from './contracts/events.contract';
export * from './contracts/projects.contract';
export * from './contracts/tasks.contract';
export { ApiCode } from './enums/api-code.enum';
export { TASK_PRIORITIES, TaskPriority } from './enums/task-priority.enum';
export { TASK_STATUSES, TaskStatus } from './enums/task-status.enum';
export type { ApiErrorResponse, ApiSuccessResponse } from './api-response';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    overdueCount: number;
    soonDueCount: number;
  };
}

export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogDto {
  id: string;
  projectId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface ProjectQueryDto extends PaginationQueryDto {
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'dueDate';
  sortDir?: 'asc' | 'desc';
}

export interface TaskQueryDto extends PaginationQueryDto {
  search?: string;
  status?: TaskStatus;
  sortBy?: 'createdAt' | 'title' | 'dueDate' | 'priority';
  sortDir?: 'asc' | 'desc';
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

export interface ProjectOwnershipRequest {
  projectId: string;
  userId: string;
}

export interface ProjectOwnershipResponse {
  projectId: string;
  ownerId: string;
  name: string;
}

export interface DeleteProjectTasksRequest {
  projectId: string;
  userId: string;
}

export interface DeleteProjectTasksResponse {
  deletedCount: number;
}
