import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name visible in the dashboard.',
    example: 'Product Launch',
    minLength: 2,
    maxLength: 80
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({
    description: 'Short project summary.',
    example: 'Tasks required for the Q3 launch.',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Project due date.',
    example: '2026-08-15T00:00:00.000Z'
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}
