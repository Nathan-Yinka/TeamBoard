import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiCode, PaginatedResponse, TaskDto, TaskPriority, TaskStatus } from '@teamboard/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import {
  ApiEnvelopeBadRequest,
  ApiEnvelopeNotFound,
  ApiEnvelopeOk,
  ApiEnvelopeUnauthorized
} from '../../common/swagger/api-envelope.decorators';
import { TaskResponseDto } from '../../common/swagger/response-models.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskQueryDto } from '../dto/task-query.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { TasksService } from '../services/tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'List project tasks', description: 'Returns all tasks for a project owned by the authenticated user with pagination and filters.' })
  @ApiParam({ name: 'projectId', description: 'Project id.', example: '665f1c5c8a0f0f0012ab34cd' })
  @ApiEnvelopeOk({
    description: 'Tasks returned successfully.',
    model: TaskResponseDto,
    isArray: true,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        data: [
          {
            id: '665f1c5c8a0f0f0012ab34ce',
            projectId: '665f1c5c8a0f0f0012ab34cd',
            title: 'Prepare launch checklist',
            description: 'Confirm owners, dates, and release dependencies.',
            status: TaskStatus.InProgress,
            priority: TaskPriority.High,
            dueDate: '2026-07-15T00:00:00.000Z',
            createdAt: '2026-06-28T12:00:00.000Z',
            updatedAt: '2026-06-28T12:30:00.000Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1
      },
      path: '/projects/665f1c5c8a0f0f0012ab34cd/tasks',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Project was not found.')
  findByProject(@Param('projectId') projectId: string, @Query() query: TaskQueryDto): Promise<PaginatedResponse<TaskDto>> {
    this.logger.debug(`Task list request for project ${projectId}`);
    return this.tasksService.findByProject(projectId, query);
  }

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Create project task', description: 'Creates a task under a project owned by the authenticated user.' })
  @ApiParam({ name: 'projectId', description: 'Project id.', example: '665f1c5c8a0f0f0012ab34cd' })
  @ApiBody({ type: CreateTaskDto })
  @ApiEnvelopeOk({
    description: 'Task created successfully.',
    model: TaskResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34ce',
        projectId: '665f1c5c8a0f0f0012ab34cd',
        title: 'Prepare launch checklist',
        description: 'Confirm owners, dates, and release dependencies.',
        status: TaskStatus.Todo,
        priority: TaskPriority.High,
        dueDate: '2026-07-15T00:00:00.000Z',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:00:00.000Z'
      },
      path: '/projects/665f1c5c8a0f0f0012ab34cd/tasks',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Project was not found.')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TaskDto> {
    this.logger.log(`Task create request for project ${projectId}`);
    return this.tasksService.create(projectId, user, dto);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task', description: 'Updates a task owned through one of the authenticated user projects.' })
  @ApiParam({ name: 'id', description: 'Task id.', example: '665f1c5c8a0f0f0012ab34ce' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiEnvelopeOk({
    description: 'Task updated successfully.',
    model: TaskResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34ce',
        projectId: '665f1c5c8a0f0f0012ab34cd',
        title: 'Prepare launch checklist',
        description: 'Confirm owners, dates, and release dependencies.',
        status: TaskStatus.InProgress,
        priority: TaskPriority.Medium,
        dueDate: '2026-07-15T00:00:00.000Z',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:30:00.000Z'
      },
      path: '/tasks/665f1c5c8a0f0f0012ab34ce',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Task was not found.')
  update(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TaskDto> {
    this.logger.log(`Task update request for task ${taskId}`);
    return this.tasksService.update(taskId, user, dto);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Update task status', description: 'Quickly updates the status of a task.' })
  @ApiParam({ name: 'id', description: 'Task id.', example: '665f1c5c8a0f0f0012ab34ce' })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiEnvelopeOk({
    description: 'Task status updated successfully.',
    model: TaskResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34ce',
        projectId: '665f1c5c8a0f0f0012ab34cd',
        title: 'Prepare launch checklist',
        description: 'Confirm owners, dates, and release dependencies.',
        status: TaskStatus.InProgress,
        priority: TaskPriority.Medium,
        dueDate: '2026-07-15T00:00:00.000Z',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:30:00.000Z'
      },
      path: '/tasks/665f1c5c8a0f0f0012ab34ce',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Task was not found.')
  updateStatus(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TaskDto> {
    this.logger.log(`Task status update request for task ${taskId}`);
    return this.tasksService.updateStatus(taskId, user, dto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task', description: 'Deletes a task owned through one of the authenticated user projects.' })
  @ApiParam({ name: 'id', description: 'Task id.', example: '665f1c5c8a0f0f0012ab34ce' })
  @ApiEnvelopeOk({
    description: 'Task deleted successfully.',
    model: TaskResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34ce',
        projectId: '665f1c5c8a0f0f0012ab34cd',
        title: 'Prepare launch checklist',
        description: 'Confirm owners, dates, and release dependencies.',
        status: TaskStatus.InProgress,
        priority: TaskPriority.High,
        dueDate: '2026-07-15T00:00:00.000Z',
        createdAt: '2026-06-28T12:00:00.000Z',
        updatedAt: '2026-06-28T12:30:00.000Z'
      },
      path: '/tasks/665f1c5c8a0f0f0012ab34ce',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  @ApiEnvelopeNotFound('Task was not found.')
  delete(@Param('id') taskId: string, @CurrentUser() user: AuthenticatedUser): Promise<TaskDto> {
    this.logger.warn(`Task delete request for task ${taskId}`);
    return this.tasksService.delete(taskId, user);
  }
}
