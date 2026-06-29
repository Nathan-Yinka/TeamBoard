import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { ProjectsClient } from '../projects/clients/projects.client';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksController } from './controllers/tasks.controller';
import { TasksMessageController } from './controllers/tasks.message-controller';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [CommonModule, MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
  controllers: [TasksController, TasksMessageController],
  providers: [TasksRepository, TasksService, ProjectsClient]
})
export class TasksModule {}
