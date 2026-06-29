export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done'
}

export const TASK_STATUSES: readonly TaskStatus[] = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
