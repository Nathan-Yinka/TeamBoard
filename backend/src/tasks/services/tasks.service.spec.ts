import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskPriority, TaskStatus } from '@teamboard/shared';
import { ProjectsClient } from '../../projects/clients/projects.client';
import { TasksRepository } from '../repositories/tasks.repository';
import { TasksService } from './tasks.service';
import { TaskRecord } from '../types/task-record.type';

describe('TasksService', () => {
  const task: TaskRecord = {
    id: '507f1f77bcf86cd799439011',
    projectId: '507f1f77bcf86cd799439012',
    ownerId: '507f1f77bcf86cd799439013',
    title: 'Prepare board',
    description: '',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    dueDate: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  };

  const repository = {
    createTask: jest.fn<Promise<TaskRecord>, [string, string, { title: string }]>(),
    findOwnedProjectTasks: jest.fn<Promise<TaskRecord[]>, [string, string]>(),
    updateOwnedTask: jest.fn<Promise<TaskRecord | null>, [string, string, { title?: string }]>(),
    deleteOwnedTask: jest.fn<Promise<TaskRecord | null>, [string, string]>(),
    deleteByProjectId: jest.fn<Promise<number>, [string, string]>()
  };

  const projectsClient = {
    assertOwner: jest.fn<Promise<{ projectId: string; ownerId: string; name: string }>, [{ projectId: string; userId: string }]>()
  };

  let service: TasksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: repository },
        { provide: ProjectsClient, useValue: projectsClient }
      ]
    }).compile();

    service = moduleRef.get(TasksService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    projectsClient.assertOwner.mockResolvedValue({
      projectId: task.projectId,
      ownerId: task.ownerId,
      name: 'Launch'
    });
  });

  it('checks project ownership before creating a task', async () => {
    repository.createTask.mockResolvedValue(task);

    await service.create(task.projectId, task.ownerId, { title: task.title });

    expect(projectsClient.assertOwner).toHaveBeenCalledWith({ projectId: task.projectId, userId: task.ownerId });
  });

  it('throws when updating a missing task', async () => {
    repository.updateOwnedTask.mockResolvedValue(null);

    await expect(service.update(task.id, task.ownerId, { title: 'New title' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
