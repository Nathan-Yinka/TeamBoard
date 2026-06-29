import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginatedResponse, ProjectDto, ProjectsAssertOwnerResponse, ProjectsGetSummaryResponse } from '@teamboard/shared';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { TasksClient } from '../../tasks/clients/tasks.client';
import { AuditLogsService } from './audit-logs.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectQueryDto } from '../dto/project-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectRecord } from '../types/project-record.type';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksClient: TasksClient,
    private readonly auditLogsService: AuditLogsService
  ) {}

  async create(dto: CreateProjectDto, user: AuthenticatedUser): Promise<ProjectDto> {
    const project = await this.projectsRepository.createProject(dto, user.id);
    this.logger.log(`Project ${project.id} created for user ${user.id}`);
    
    await this.auditLogsService.logAction(project.id, user.email, 'PROJECT_CREATED', `Project "${project.name}" was created`);
    return this.toDto(project);
  }

  async findAll(query: ProjectQueryDto): Promise<PaginatedResponse<ProjectDto>> {
    const { projects, total } = await this.projectsRepository.findAllProjects(query);
    const page = query.page || 1;
    const limit = query.limit || 20;

    const projectIds = projects.map(p => p.id);
    const stats = await this.tasksClient.getProjectStats(projectIds);

    return {
      items: projects.map((project) => ({
        ...this.toDto(project),
        stats: stats[project.id] || { overdueCount: 0, soonDueCount: 0 }
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(projectId: string): Promise<ProjectDto> {
    const project = await this.projectsRepository.findProjectById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    return this.toDto(project);
  }

  async update(projectId: string, user: AuthenticatedUser, dto: UpdateProjectDto): Promise<ProjectDto> {
    const oldProject = await this.projectsRepository.findProjectById(projectId);
    if (!oldProject) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectsRepository.updateOwnedProject(projectId, user.id, dto);

    if (!project) {
      throw new NotFoundException('Project not found or you are not the owner');
    }

    const changes: string[] = [];
    if (dto.name !== undefined && dto.name !== oldProject.name) changes.push(`name from "${oldProject.name}" to "${dto.name}"`);
    if (dto.description !== undefined && dto.description !== oldProject.description) changes.push(`description`);

    const details = changes.length > 0
      ? `Project updated: ${changes.join(', ')}`
      : `Project details were updated`;

    await this.auditLogsService.logAction(projectId, user.email, 'PROJECT_UPDATED', details);
    return this.toDto(project);
  }

  async delete(projectId: string, user: AuthenticatedUser): Promise<ProjectDto> {
    const existingProject = await this.findOwnedProjectOrThrow(projectId, user.id);
    await this.tasksClient.deleteByProject({ projectId, userId: user.id });
    const project = await this.projectsRepository.deleteOwnedProject(projectId, user.id);

    if (!project) {
      throw new NotFoundException('Project not found or you are not the owner');
    }

    this.logger.warn(`Project ${existingProject.id} deleted for user ${user.id}`);
    return this.toDto(project);
  }

  async assertOwner(projectId: string, userId: string): Promise<ProjectsAssertOwnerResponse> {
    const project = await this.findOwnedProjectOrThrow(projectId, userId);
    this.logger.debug(`Project ownership confirmed for project ${projectId}`);

    return {
      projectId: project.id,
      ownerId: project.ownerId,
      name: project.name
    };
  }

  async getSummary(projectId: string): Promise<ProjectsGetSummaryResponse> {
    const project = await this.projectsRepository.findProjectById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    return {
      projectId: project.id,
      name: project.name,
      description: project.description
    };
  }

  private async findOwnedProjectOrThrow(projectId: string, userId: string): Promise<ProjectRecord> {
    const project = await this.projectsRepository.findProjectById(projectId);

    if (!project || project.ownerId !== userId) {
      throw new NotFoundException('Project not found or you are not the owner');
    }

    return project;
  }

  private toDto(project: ProjectRecord): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      dueDate: project.dueDate ? project.dueDate.toISOString() : '',
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };
  }
}
