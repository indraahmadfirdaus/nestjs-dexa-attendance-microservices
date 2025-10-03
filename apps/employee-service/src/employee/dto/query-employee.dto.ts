import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '@libs/common';

export class QueryEmployeeDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(['EMPLOYEE', 'ADMIN'])
  role?: 'EMPLOYEE' | 'ADMIN';
}