import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Updated project name.',
    example: 'Product Launch',
    minLength: 2,
    maxLength: 80
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated project summary.',
    example: 'Tasks required for the Q3 launch.',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated project due date.',
    example: '2026-08-15T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
