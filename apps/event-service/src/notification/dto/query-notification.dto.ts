import { IsOptional, IsBoolean } from 'class-validator';
import { PaginationDto } from '@libs/common';
import { Transform } from 'class-transformer';

export class QueryNotificationDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;
}