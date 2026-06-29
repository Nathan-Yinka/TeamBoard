import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiCode, AuditLogDto, PaginatedResponse } from '@teamboard/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiEnvelopeOk, ApiEnvelopeUnauthorized } from '../../common/swagger/api-envelope.decorators';
import { AuditLogsService } from '../services/audit-logs.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('projects/:projectId/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  private readonly logger = new Logger(AuditLogsController.name);

  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List project audit logs', description: 'Returns recent audit logs for a project.' })
  @ApiParam({ name: 'projectId', description: 'Project id.', example: '665f1c5c8a0f0f0012ab34cd' })
  @ApiEnvelopeOk({
    description: 'Audit logs returned successfully.',
    model: Object, // Mock model
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        items: [
          {
            id: '665f1c5c8a0f0f0012ab34cd',
            projectId: '665f1c5c8a0f0f0012ab34cd',
            userEmail: 'user@example.com',
            action: 'CREATED_TASK',
            details: 'Created task "Design phase"',
            createdAt: '2026-06-28T12:00:00.000Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1
      },
      path: '/projects/123/audit-logs',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  async findAll(@Param('projectId') projectId: string): Promise<PaginatedResponse<AuditLogDto>> {
    this.logger.debug(`Audit logs request for project ${projectId}`);
    const logs = await this.auditLogsService.findByProject(projectId);
    
    return {
      items: logs,
      total: logs.length,
      page: 1,
      limit: 50,
      totalPages: 1
    };
  }
}
