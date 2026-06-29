import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiCode, PaginatedResponse, ProjectDto } from '@teamboard/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import {
  ApiEnvelopeBadRequest,
  ApiEnvelopeNotFound,
  ApiEnvelopeOk,
  ApiEnvelopeUnauthorized
} from '../../common/swagger/api-envelope.decorators';
import { ProjectResponseDto } from '../../common/swagger/response-models.dto';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectQueryDto } from '../dto/project-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsService } from '../services/projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects', description: 'Returns all projects with pagination and search.' })
  @ApiEnvelopeOk({
    description: 'Projects returned successfully.',
    model: ProjectResponseDto,
    isArray: true,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        items: [
          {
            id: '665f1c5c8a0f0f0012ab34cd',
            name: 'Product Launch',
            description: 'Tasks required for the Q3 launch.',
            dueDate: '2026-08-15T00:00:00.000Z',
            ownerId: '665f1c5c8a0f0f0012ab34cd',
            createdAt: '2026-06-28T12:00:00.000Z',
            updatedAt: '2026-06-28T12:30:00.000Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1
      },
      path: '/projects',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  findAll(@Query() query: ProjectQueryDto): Promise<PaginatedResponse<ProjectDto>> {
    this.logger.debug(`Project list request`);
    return this.projectsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create project', description: 'Creates a project for the authenticated user.' })
  @ApiBody({ type: CreateProjectDto })
  @ApiEnvelopeOk({
    description: 'Project created successfully.',
    model: ProjectResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34cd',
        name: 'Product Launch',
        description: 'Tasks required for the Q3 launch.',
        dueDate: '2026-08-15T00:00:00.000Z',
        ownerId: '665f1c5c8a0f0f0012ab34cd',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:00:00.000Z'
      },
      path: '/projects',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeUnauthorized()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthenticatedUser): Promise<ProjectDto> {
    this.logger.log(`Project create request for user ${user.id}`);
    return this.projectsService.create(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project', description: 'Returns one project by id.' })
  @ApiParam({ name: 'id', description: 'Project id.', example: '665f1c5c8a0f0f0012ab34cd' })
  @ApiEnvelopeOk({
    description: 'Project returned successfully.',
    model: ProjectResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34cd',
        name: 'Product Launch',
        description: 'Tasks required for the Q3 launch.',
        dueDate: '2026-08-15T00:00:00.000Z',
        ownerId: '665f1c5c8a0f0f0012ab34cd',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:30:00.000Z'
      },
      path: '/projects/665f1c5c8a0f0f0012ab34cd',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Project was not found.')
  findOne(@Param('id') projectId: string): Promise<ProjectDto> {
    this.logger.debug(`Project detail request for project ${projectId}`);
    return this.projectsService.findOne(projectId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project', description: 'Updates a project owned by the authenticated user.' })
  @ApiParam({ name: 'id', description: 'Project id.', example: '665f1c5c8a0f0f0012ab34cd' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiEnvelopeOk({
    description: 'Project updated successfully.',
    model: ProjectResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34cd',
        name: 'Product Launch',
        description: 'Tasks required for the Q3 launch.',
        dueDate: '2026-08-15T00:00:00.000Z',
        ownerId: '665f1c5c8a0f0f0012ab34cd',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:30:00.000Z'
      },
      path: '/projects/665f1c5c8a0f0f0012ab34cd',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Project was not found or is not owned by the authenticated user.')
  update(
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ProjectDto> {
    this.logger.log(`Project update request for project ${projectId}`);
    return this.projectsService.update(projectId, user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project', description: 'Deletes a project owned by the authenticated user.' })
  @ApiParam({ name: 'id', description: 'Project id.', example: '665f1c5c8a0f0f0012ab34cd' })
  @ApiEnvelopeOk({
    description: 'Project deleted successfully.',
    model: ProjectResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34cd',
        name: 'Product Launch',
        description: 'Tasks required for the Q3 launch.',
        dueDate: '2026-08-15T00:00:00.000Z',
        ownerId: '665f1c5c8a0f0f0012ab34cd',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:30:00.000Z'
      },
      path: '/projects/665f1c5c8a0f0f0012ab34cd',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Project was not found or is not owned by the authenticated user.')
  delete(@Param('id') projectId: string, @CurrentUser() user: AuthenticatedUser): Promise<ProjectDto> {
    this.logger.warn(`Project delete request for project ${projectId}`);
    return this.projectsService.delete(projectId, user);
  }
}
