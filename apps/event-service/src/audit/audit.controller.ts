import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { QueryAuditLogDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard } from '@libs/common';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() queryDto: QueryAuditLogDto) {
    return this.auditService.findAll(queryDto);
  }

  @Get('stats')
  getStats(@Query('userId') userId?: string) {
    return this.auditService.getStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}