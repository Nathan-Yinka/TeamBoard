import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { TaskQueryDto as ITaskQueryDto, TaskStatus } from '@teamboard/shared';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class TaskQueryDto extends PaginationQueryDto implements ITaskQueryDto {
  @ApiPropertyOptional({ description: 'Search term for title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by task status', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: ['createdAt', 'title', 'dueDate', 'priority'] })
  @IsOptional()
  @IsIn(['createdAt', 'title', 'dueDate', 'priority'])
  sortBy?: 'createdAt' | 'title' | 'dueDate' | 'priority';

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
