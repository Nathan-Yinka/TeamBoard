import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus, UpdateTaskStatusDto as IUpdateTaskStatusDto } from '@teamboard/shared';

export class UpdateTaskStatusDto implements IUpdateTaskStatusDto {
  @ApiProperty({ description: 'The new status of the task', enum: TaskStatus })
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
