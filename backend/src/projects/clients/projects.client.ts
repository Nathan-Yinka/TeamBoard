import { Injectable, Logger, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import {
  ProjectsAssertOwnerRequest,
  ProjectsAssertOwnerResponse,
  ProjectsMessagePatterns
} from '@teamboard/shared';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { InternalTcpClientFactory } from '../../common/clients/internal-tcp-client.factory';

@Injectable()
export class ProjectsClient implements OnModuleDestroy {
  private readonly logger = new Logger(ProjectsClient.name);
  private readonly client: ClientProxy;

  constructor(clientFactory: InternalTcpClientFactory) {
    this.client = clientFactory.createClient();
  }

  async assertOwner(payload: ProjectsAssertOwnerRequest): Promise<ProjectsAssertOwnerResponse> {
    this.logger.debug(`Sending ownership check for project ${payload.projectId}`);
    return lastValueFrom(
      this.client.send<ProjectsAssertOwnerResponse, ProjectsAssertOwnerRequest>(
        ProjectsMessagePatterns.AssertOwner,
        payload
      ).pipe(
        timeout(3000),
        catchError(() => {
          this.logger.error(`Project ownership check failed for project ${payload.projectId}`);
          throw new ServiceUnavailableException('Project service boundary is unavailable');
        })
      )
    );
  }

  logAudit(payload: import('@teamboard/shared').ProjectsLogAuditRequest): void {
    this.client.emit(ProjectsMessagePatterns.LogAudit, payload);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
    this.logger.log('Closed projects TCP client');
  }
}
