import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus } from '@teamboard/shared';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ required: true, enum: TASK_STATUSES, default: TaskStatus.Todo })
  status: TaskStatus;

  @Prop({ required: true, enum: TASK_PRIORITIES, default: TaskPriority.Medium })
  priority: TaskPriority;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project', index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  ownerId: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
