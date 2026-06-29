import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ProjectQueryDto as IProjectQueryDto } from '@teamboard/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ProjectQueryDto extends PaginationQueryDto implements IProjectQueryDto {
  @ApiPropertyOptional({ description: 'Search term for name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: ['createdAt', 'name', 'dueDate'] })
  @IsOptional()
  @IsIn(['createdAt', 'name', 'dueDate'])
  sortBy?: 'createdAt' | 'name' | 'dueDate';

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
