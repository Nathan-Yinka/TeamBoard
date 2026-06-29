import { Controller } from '@nestjs/common';
import {
  ProjectsAssertOwnerRequest,
  ProjectsAssertOwnerResponse,
  ProjectsGetSummaryRequest,
  ProjectsGetSummaryResponse,
  ProjectsMessagePatterns,
  ProjectsLogAuditRequest
} from '@teamboard/shared';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from '../services/projects.service';
import { AuditLogsService } from '../services/audit-logs.service';

@Controller()
export class ProjectsMessageController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly auditLogsService: AuditLogsService
  ) {}

  @MessagePattern(ProjectsMessagePatterns.AssertOwner)
  assertOwner(@Payload() payload: ProjectsAssertOwnerRequest): Promise<ProjectsAssertOwnerResponse> {
    return this.projectsService.assertOwner(payload.projectId, payload.userId);
  }

  @MessagePattern(ProjectsMessagePatterns.GetSummary)
  getSummary(@Payload() payload: ProjectsGetSummaryRequest): Promise<ProjectsGetSummaryResponse> {
    return this.projectsService.getSummary(payload.projectId);
  }

  @EventPattern(ProjectsMessagePatterns.LogAudit)
  logAudit(@Payload() payload: ProjectsLogAuditRequest): void {
    this.auditLogsService.logAction(payload.projectId, payload.userEmail, payload.action, payload.details);
  }
}
