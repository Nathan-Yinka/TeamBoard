import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { TasksClient } from '../tasks/clients/tasks.client';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { AuditLogsService } from './services/audit-logs.service';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsMessageController } from './controllers/projects.message-controller';
import { ProjectsRepository } from './repositories/projects.repository';
import { ProjectsService } from './services/projects.service';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { Project, ProjectSchema } from './schemas/project.schema';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: AuditLog.name, schema: AuditLogSchema }
    ])
  ],
  controllers: [ProjectsController, ProjectsMessageController, AuditLogsController],
  providers: [ProjectsRepository, ProjectsService, AuditLogsRepository, AuditLogsService, TasksClient],
  exports: [AuditLogsService]
})
export class ProjectsModule {}
