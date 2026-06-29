import { Injectable, Logger, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import {
  TasksDeleteByProjectRequest,
  TasksDeleteByProjectResponse,
  TasksMessagePatterns
} from '@teamboard/shared';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { InternalTcpClientFactory } from '../../common/clients/internal-tcp-client.factory';

@Injectable()
export class TasksClient implements OnModuleDestroy {
  private readonly logger = new Logger(TasksClient.name);
  private readonly client: ClientProxy;

  constructor(clientFactory: InternalTcpClientFactory) {
    this.client = clientFactory.createClient();
  }

  async deleteByProject(payload: TasksDeleteByProjectRequest): Promise<TasksDeleteByProjectResponse> {
    this.logger.debug(`Sending task cleanup for project ${payload.projectId}`);
    return lastValueFrom(
      this.client.send<TasksDeleteByProjectResponse, TasksDeleteByProjectRequest>(
        TasksMessagePatterns.DeleteByProject,
        payload
      ).pipe(
        timeout(3000),
        catchError(() => {
          this.logger.error(`Task cleanup failed for project ${payload.projectId}`);
          throw new ServiceUnavailableException('Task service boundary is unavailable');
        })
      )
    );
  }

  async getProjectStats(projectIds: string[]): Promise<Record<string, { overdueCount: number; soonDueCount: number }>> {
    if (projectIds.length === 0) return {};
    this.logger.debug(`Fetching task stats for ${projectIds.length} projects`);
    
    return lastValueFrom(
      this.client.send<import('@teamboard/shared').TasksGetProjectStatsResponse, import('@teamboard/shared').TasksGetProjectStatsRequest>(
        TasksMessagePatterns.GetProjectStats,
        { projectIds }
      ).pipe(
        timeout(3000),
        catchError(() => {
          this.logger.error(`Task stats fetch failed`);
          // Fail gracefully by returning empty stats
          return [{ stats: {} }];
        })
      )
    ).then(res => res.stats);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
    this.logger.log('Closed tasks TCP client');
  }
}
