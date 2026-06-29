import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@teamboard/shared';

export class AuthUserResponseDto {
  @ApiProperty({ example: '665f1c5c8a0f0f0012ab34cd' })
  id: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token used as a bearer token for authenticated endpoints.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}

export class ProjectResponseDto {
  @ApiProperty({ example: '665f1c5c8a0f0f0012ab34cd' })
  id: string;

  @ApiProperty({ example: 'Product Launch' })
  name: string;

  @ApiProperty({ example: 'Tasks required for the Q3 launch.' })
  description: string;

  @ApiProperty({ example: '2026-06-28T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-06-28T12:30:00.000Z' })
  updatedAt: string;
}

export class TaskResponseDto {
  @ApiProperty({ example: '665f1c5c8a0f0f0012ab34ce' })
  id: string;

  @ApiProperty({ example: '665f1c5c8a0f0f0012ab34cd' })
  projectId: string;

  @ApiProperty({ example: 'Prepare launch checklist' })
  title: string;

  @ApiProperty({ example: 'Confirm owners, dates, and release dependencies.' })
  description: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.InProgress })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.High })
  priority: TaskPriority;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z', nullable: true })
  dueDate: string | null;

  @ApiProperty({ example: '2026-06-28T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-06-28T12:30:00.000Z' })
  updatedAt: string;
}
