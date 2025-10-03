import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PaginationDto } from '@libs/common';

export class QueryAuditLogDto extends PaginationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum([
    'PROFILE_UPDATE',
    'PASSWORD_CHANGE',
    'PHOTO_UPDATE',
    'PHONE_UPDATE',
    'ATTENDANCE_CLOCK_IN',
    'ATTENDANCE_CLOCK_OUT',
    'EMPLOYEE_CREATED',
    'EMPLOYEE_UPDATED',
    'EMPLOYEE_DELETED',
  ])
  eventType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}