import { TaskPriority, TaskStatus } from '@teamboard/shared';

export interface TaskRecord {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
