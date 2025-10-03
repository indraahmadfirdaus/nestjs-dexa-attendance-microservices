import { IsOptional, IsDateString } from 'class-validator';
import { PaginationDto } from '@libs/common';

export class QueryAttendanceDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}