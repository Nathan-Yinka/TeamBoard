export const TasksMessagePatterns = {
  DeleteByProject: 'tasks.project_tasks.delete_by_project',
  GetProjectStats: 'tasks.project_tasks.get_stats'
} as const;

export interface TasksDeleteByProjectRequest {
  projectId: string;
  userId: string;
}

export interface TasksDeleteByProjectResponse {
  deletedCount: number;
}

export interface TasksGetProjectStatsRequest {
  projectIds: string[];
}

export interface TasksGetProjectStatsResponse {
  stats: Record<string, { overdueCount: number; soonDueCount: number }>;
}
