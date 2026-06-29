import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@teamboard/shared';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Updated task title.',
    example: 'Prepare launch checklist',
    minLength: 2,
    maxLength: 120
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated task details or acceptance notes.',
    example: 'Confirm owners, dates, and release dependencies.',
    maxLength: 800
  })
  @IsOptional()
  @IsString()
  @MaxLength(800)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated task workflow status.',
    enum: TaskStatus,
    example: TaskStatus.InProgress
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Updated task priority.',
    enum: TaskPriority,
    example: TaskPriority.Medium
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Updated ISO-8601 due date.',
    example: '2026-07-15T00:00:00.000Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
