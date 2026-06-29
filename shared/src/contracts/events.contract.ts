import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export const DomainEventPatterns = {
  ProjectDeleted: 'events.project.deleted',
  TaskCreated: 'events.task.created',
  TaskUpdated: 'events.task.updated'
} as const;

export interface ProjectDeletedEvent {
  projectId: string;
  userId: string;
}

export interface TaskCreatedEvent {
  taskId: string;
  projectId: string;
  userId: string;
}

export interface TaskUpdatedEvent {
  taskId: string;
  projectId: string;
  userId: string;
  status: TaskStatus;
  priority: TaskPriority;
}
