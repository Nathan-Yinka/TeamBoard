import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectQueryDto } from '../dto/project-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project } from '../schemas/project.schema';
import { ProjectRecord } from '../types/project-record.type';

@Injectable()
export class ProjectsRepository {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<Project>) {}

  async createProject(dto: CreateProjectDto, ownerId: string): Promise<ProjectRecord> {
    const project = await this.projectModel.create({
      name: dto.name,
      description: dto.description ?? '',
      dueDate: new Date(dto.dueDate),
      ownerId: new Types.ObjectId(ownerId)
    });
    return this.toRecord(project);
  }

  async findAllProjects(query: ProjectQueryDto): Promise<{ projects: ProjectRecord[]; total: number }> {
    const filter: any = {};
    
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const sortConfig: any = {};
    if (query.sortBy) {
      sortConfig[query.sortBy] = query.sortDir === 'asc' ? 1 : -1;
    } else {
      sortConfig.updatedAt = -1;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.projectModel.find(filter).sort(sortConfig).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(filter).exec()
    ]);

    return {
      projects: projects.map((project) => this.toRecord(project)),
      total
    };
  }

  async findProjectById(projectId: string): Promise<ProjectRecord | null> {
    if (!Types.ObjectId.isValid(projectId)) {
      return null;
    }

    const project = await this.projectModel
      .findOne({ _id: new Types.ObjectId(projectId) })
      .exec();
    return project ? this.toRecord(project) : null;
  }

  async updateOwnedProject(projectId: string, ownerId: string, dto: UpdateProjectDto): Promise<ProjectRecord | null> {
    if (!this.hasValidIds(projectId, ownerId)) {
      return null;
    }

    const project = await this.projectModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(projectId), ownerId: new Types.ObjectId(ownerId) },
        { $set: this.toUpdatePayload(dto) },
        { new: true }
      )
      .exec();
    return project ? this.toRecord(project) : null;
  }

  async deleteOwnedProject(projectId: string, ownerId: string): Promise<ProjectRecord | null> {
    if (!this.hasValidIds(projectId, ownerId)) {
      return null;
    }

    const project = await this.projectModel
      .findOneAndDelete({ _id: new Types.ObjectId(projectId), ownerId: new Types.ObjectId(ownerId) })
      .exec();
    return project ? this.toRecord(project) : null;
  }

  private hasValidIds(projectId: string, ownerId: string): boolean {
    return Types.ObjectId.isValid(projectId) && Types.ObjectId.isValid(ownerId);
  }

  private toUpdatePayload(dto: UpdateProjectDto): Partial<Pick<Project, 'name' | 'description' | 'dueDate'>> {
    return {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.dueDate !== undefined ? { dueDate: new Date(dto.dueDate) } : {})
    };
  }

  private toRecord(project: Project): ProjectRecord {
    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      dueDate: project.dueDate,
      ownerId: project.ownerId.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }
}
