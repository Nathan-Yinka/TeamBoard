import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TaskPriority, TaskStatus } from '@teamboard/shared';
import { Model, Types } from 'mongoose';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskQueryDto } from '../dto/task-query.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../schemas/task.schema';
import { TaskRecord } from '../types/task-record.type';
import { TASK_SOON_DUE_THRESHOLD_DAYS } from '../constants';

@Injectable()
export class TasksRepository {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<Task>) {}

  async createTask(projectId: string, ownerId: string, dto: CreateTaskDto): Promise<TaskRecord> {
    const task = await this.taskModel.create({
      projectId: new Types.ObjectId(projectId),
      ownerId: new Types.ObjectId(ownerId),
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? TaskStatus.Todo,
      priority: dto.priority ?? TaskPriority.Medium,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null
    });
    return this.toRecord(task);
  }

  async findProjectTasks(projectId: string, query: TaskQueryDto): Promise<{ tasks: TaskRecord[]; total: number; statusCounts: Record<string, number> }> {
    if (!Types.ObjectId.isValid(projectId)) {
      return { tasks: [], total: 0, statusCounts: { todo: 0, in_progress: 0, done: 0 } };
    }

    const filter: any = { 
      projectId: new Types.ObjectId(projectId)
    };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.status) {
      filter.status = query.status;
    }

    const sortConfig: any = {};
    if (query.sortBy) {
      sortConfig[query.sortBy] = query.sortDir === 'asc' ? 1 : -1;
    } else {
      sortConfig.createdAt = -1;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [tasks, total, statusCountsRaw] = await Promise.all([
      this.taskModel.find(filter).sort(sortConfig).skip(skip).limit(limit).exec(),
      this.taskModel.countDocuments(filter).exec(),
      this.taskModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).exec()
    ]);

    const statusCounts: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      done: 0
    };

    for (const res of statusCountsRaw) {
      if (res._id) {
        statusCounts[res._id] = res.count;
      }
    }

    return {
      tasks: tasks.map((task) => this.toRecord(task)),
      total,
      statusCounts
    };
  }

  async findTaskById(taskId: string): Promise<TaskRecord | null> {
    if (!Types.ObjectId.isValid(taskId)) {
      return null;
    }
    const task = await this.taskModel.findById(taskId).exec();
    return task ? this.toRecord(task) : null;
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskRecord | null> {
    if (!Types.ObjectId.isValid(taskId)) {
      return null;
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(taskId) },
        { $set: this.toUpdatePayload(dto) },
        { new: true }
      )
      .exec();
    return task ? this.toRecord(task) : null;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<TaskRecord | null> {
    if (!Types.ObjectId.isValid(taskId)) {
      return null;
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(taskId) },
        { $set: { status } },
        { new: true }
      )
      .exec();
    return task ? this.toRecord(task) : null;
  }

  async deleteTask(taskId: string): Promise<TaskRecord | null> {
    if (!Types.ObjectId.isValid(taskId)) {
      return null;
    }

    const task = await this.taskModel
      .findOneAndDelete({ _id: new Types.ObjectId(taskId) })
      .exec();
    return task ? this.toRecord(task) : null;
  }

  async deleteByProjectId(projectId: string): Promise<number> {
    if (!Types.ObjectId.isValid(projectId)) {
      return 0;
    }

    const result = await this.taskModel
      .deleteMany({ projectId: new Types.ObjectId(projectId) })
      .exec();
    return result.deletedCount;
  }

  async getProjectStats(projectIds: string[]): Promise<Record<string, { overdueCount: number; soonDueCount: number }>> {
    const objectIds = projectIds.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id));
    if (objectIds.length === 0) return {};

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + TASK_SOON_DUE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

    const pipeline = [
      {
        $match: {
          projectId: { $in: objectIds },
          status: { $ne: TaskStatus.Done },
          dueDate: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$projectId',
          overdueCount: {
            $sum: { $cond: [{ $lt: ['$dueDate', now] }, 1, 0] }
          },
          soonDueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$dueDate', now] },
                    { $lte: ['$dueDate', threeDaysFromNow] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    const results = await this.taskModel.aggregate(pipeline).exec();

    const stats: Record<string, { overdueCount: number; soonDueCount: number }> = {};
    for (const projectId of projectIds) {
      stats[projectId] = { overdueCount: 0, soonDueCount: 0 };
    }

    for (const res of results) {
      const pid = res._id.toString();
      stats[pid] = {
        overdueCount: res.overdueCount,
        soonDueCount: res.soonDueCount
      };
    }

    return stats;
  }

  private toUpdatePayload(dto: UpdateTaskDto): Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'dueDate'>> {
    return {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.dueDate !== undefined ? { dueDate: new Date(dto.dueDate) } : {})
    };
  }

  private toRecord(task: Task): TaskRecord {
    return {
      id: task._id.toString(),
      projectId: task.projectId.toString(),
      ownerId: task.ownerId.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }
}
