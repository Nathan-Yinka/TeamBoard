import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from '../schemas/audit-log.schema';

export interface AuditLogRecord {
  id: string;
  projectId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: Date;
}

@Injectable()
export class AuditLogsRepository {
  constructor(@InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>) {}

  async createLog(projectId: string, userEmail: string, action: string, details: string): Promise<AuditLogRecord> {
    const log = await this.auditLogModel.create({
      projectId: new Types.ObjectId(projectId),
      userEmail,
      action,
      details
    });
    return this.toRecord(log);
  }

  async findByProjectId(projectId: string): Promise<AuditLogRecord[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      return [];
    }

    const logs = await this.auditLogModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return logs.map(log => this.toRecord(log));
  }

  private toRecord(log: AuditLog): AuditLogRecord {
    return {
      id: log._id.toString(),
      projectId: log.projectId.toString(),
      userEmail: log.userEmail,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt
    };
  }
}
