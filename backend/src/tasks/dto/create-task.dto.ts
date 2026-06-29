import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@teamboard/shared';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title.',
    example: 'Prepare launch checklist',
    minLength: 2,
    maxLength: 120
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({
    description: 'Task details or acceptance notes.',
    example: 'Confirm owners, dates, and release dependencies.',
    maxLength: 800
  })
  @IsOptional()
  @IsString()
  @MaxLength(800)
  description?: string;

  @ApiPropertyOptional({
    description: 'Initial task workflow status.',
    enum: TaskStatus,
    example: TaskStatus.Todo
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Initial task priority.',
    enum: TaskPriority,
    example: TaskPriority.High
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'ISO-8601 due date.',
    example: '2026-07-15T00:00:00.000Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
