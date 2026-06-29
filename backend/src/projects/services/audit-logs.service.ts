import { Injectable, Logger } from '@nestjs/common';
import { AuditLogDto } from '@teamboard/shared';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async logAction(projectId: string, userEmail: string, action: string, details: string): Promise<void> {
    try {
      await this.auditLogsRepository.createLog(projectId, userEmail, action, details);
      this.logger.log(`Audit log created: [${action}] by ${userEmail} for project ${projectId}`);
    } catch (error: any) {
      this.logger.error(`Failed to create audit log for project ${projectId}: ${error.message}`);
    }
  }

  async findByProject(projectId: string): Promise<AuditLogDto[]> {
    const logs = await this.auditLogsRepository.findByProjectId(projectId);
    return logs.map(log => ({
      id: log.id,
      projectId: log.projectId,
      userEmail: log.userEmail,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt.toISOString()
    }));
  }
}
