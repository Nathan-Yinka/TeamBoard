import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TasksClient } from '../../tasks/clients/tasks.client';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectsService } from './projects.service';
import { ProjectRecord } from '../types/project-record.type';

describe('ProjectsService', () => {
  const project: ProjectRecord = {
    id: '507f1f77bcf86cd799439011',
    name: 'Launch',
    description: 'Launch work',
    ownerId: '507f1f77bcf86cd799439012',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  };

  const repository = {
    createProject: jest.fn<Promise<ProjectRecord>, [CreateProjectDto, string]>(),
    findOwnedProjects: jest.fn<Promise<ProjectRecord[]>, [string]>(),
    findOwnedProjectById: jest.fn<Promise<ProjectRecord | null>, [string, string]>(),
    updateOwnedProject: jest.fn(),
    deleteOwnedProject: jest.fn<Promise<ProjectRecord | null>, [string, string]>()
  };

  const tasksClient = {
    deleteByProject: jest.fn<Promise<{ deletedCount: number }>, [{ projectId: string; userId: string }]>()
  };

  let service: ProjectsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectsRepository, useValue: repository },
        { provide: TasksClient, useValue: tasksClient }
      ]
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findOwnedProjectById.mockResolvedValue(project);
    repository.deleteOwnedProject.mockResolvedValue(project);
    tasksClient.deleteByProject.mockResolvedValue({ deletedCount: 2 });
  });

  it('deletes project tasks before deleting the project record', async () => {
    await service.delete(project.id, project.ownerId);

    expect(tasksClient.deleteByProject).toHaveBeenCalledWith({ projectId: project.id, userId: project.ownerId });
    expect(repository.deleteOwnedProject).toHaveBeenCalledWith(project.id, project.ownerId);
  });

  it('does not delete tasks when the project is missing', async () => {
    repository.findOwnedProjectById.mockResolvedValue(null);

    await expect(service.delete(project.id, project.ownerId)).rejects.toBeInstanceOf(NotFoundException);
    expect(tasksClient.deleteByProject).not.toHaveBeenCalled();
  });
});
