import { Controller } from '@nestjs/common';
import { 
  TasksDeleteByProjectRequest, 
  TasksDeleteByProjectResponse, 
  TasksGetProjectStatsRequest,
  TasksGetProjectStatsResponse,
  TasksMessagePatterns 
} from '@teamboard/shared';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from '../services/tasks.service';

@Controller()
export class TasksMessageController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern(TasksMessagePatterns.DeleteByProject)
  async deleteByProject(@Payload() payload: TasksDeleteByProjectRequest): Promise<TasksDeleteByProjectResponse> {
    const deletedCount = await this.tasksService.deleteByProject(payload.projectId);
    return { deletedCount };
  }

  @MessagePattern(TasksMessagePatterns.GetProjectStats)
  async getProjectStats(@Payload() payload: TasksGetProjectStatsRequest): Promise<TasksGetProjectStatsResponse> {
    const stats = await this.tasksService.getProjectStats(payload.projectIds);
    return { stats };
  }
}
