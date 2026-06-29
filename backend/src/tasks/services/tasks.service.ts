import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginatedResponse, TaskDto } from '@teamboard/shared';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { ProjectsClient } from '../../projects/clients/projects.client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskQueryDto } from '../dto/task-query.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskRecord } from '../types/task-record.type';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsClient: ProjectsClient
  ) {}

  async create(projectId: string, user: AuthenticatedUser, dto: CreateTaskDto): Promise<TaskDto> {
    const task = await this.tasksRepository.createTask(projectId, user.id, dto);
    this.logger.log(`Task ${task.id} created in project ${projectId}`);
    
    this.projectsClient.logAudit({
      projectId,
      userEmail: user.email,
      action: 'TASK_CREATED',
      details: `Task "${task.title}" was created`
    });

    return this.toDto(task);
  }

  async findByProject(projectId: string, query: TaskQueryDto): Promise<PaginatedResponse<TaskDto>> {
    const { tasks, total } = await this.tasksRepository.findProjectTasks(projectId, query);
    
    const page = query.page || 1;
    const limit = query.limit || 20;

    return {
      items: tasks.map((task) => this.toDto(task)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(taskId: string, user: AuthenticatedUser, dto: UpdateTaskDto): Promise<TaskDto> {
    const oldTask = await this.tasksRepository.findTaskById(taskId);
    if (!oldTask) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.tasksRepository.updateTask(taskId, dto);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    this.logger.log(`Task ${task.id} updated`);

    const changes: string[] = [];
    if (dto.title !== undefined && dto.title !== oldTask.title) changes.push(`title from "${oldTask.title}" to "${dto.title}"`);
    if (dto.description !== undefined && dto.description !== oldTask.description) changes.push(`description`);
    if (dto.status !== undefined && dto.status !== oldTask.status) changes.push(`status from "${oldTask.status}" to "${dto.status}"`);
    if (dto.priority !== undefined && dto.priority !== oldTask.priority) changes.push(`priority from "${oldTask.priority}" to "${dto.priority}"`);
    if (dto.dueDate !== undefined) {
      const oldDate = oldTask.dueDate ? new Date(oldTask.dueDate).toISOString() : null;
      const newDate = dto.dueDate ? new Date(dto.dueDate).toISOString() : null;
      if (oldDate !== newDate) changes.push(`due date`);
    }
    
    const details = changes.length > 0 
      ? `Task "${oldTask.title}" changed: ${changes.join(', ')}`
      : `Task "${oldTask.title}" was updated`;

    this.projectsClient.logAudit({
      projectId: task.projectId,
      userEmail: user.email,
      action: 'TASK_UPDATED',
      details
    });

    return this.toDto(task);
  }

  async updateStatus(taskId: string, user: AuthenticatedUser, dto: UpdateTaskStatusDto): Promise<TaskDto> {
    const oldTask = await this.tasksRepository.findTaskById(taskId);
    if (!oldTask) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.tasksRepository.updateTaskStatus(taskId, dto.status);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    this.logger.log(`Task ${task.id} status updated to ${dto.status}`);

    const details = oldTask.status !== dto.status
      ? `Task "${oldTask.title}" status changed from "${oldTask.status}" to "${dto.status}"`
      : `Task "${oldTask.title}" status updated`;

    this.projectsClient.logAudit({
      projectId: task.projectId,
      userEmail: user.email,
      action: 'TASK_STATUS_CHANGED',
      details
    });

    return this.toDto(task);
  }

  async delete(taskId: string, user: AuthenticatedUser): Promise<TaskDto> {
    const task = await this.tasksRepository.deleteTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    this.logger.warn(`Task ${task.id} deleted`);

    this.projectsClient.logAudit({
      projectId: task.projectId,
      userEmail: user.email,
      action: 'TASK_DELETED',
      details: `Task "${task.title}" was deleted`
    });

    return this.toDto(task);
  }

  async deleteByProject(projectId: string): Promise<number> {
    const deletedCount = await this.tasksRepository.deleteByProjectId(projectId);
    this.logger.warn(`Deleted ${deletedCount} tasks for project ${projectId}`);
    return deletedCount;
  }

  async getProjectStats(projectIds: string[]): Promise<Record<string, { overdueCount: number; soonDueCount: number }>> {
    return this.tasksRepository.getProjectStats(projectIds);
  }

  private toDto(task: TaskRecord): TaskDto {
    return {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }
}
