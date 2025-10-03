import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInDto, ClockOutDto, QueryAttendanceDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@libs/common';

@Controller('')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@CurrentUser('sub') userId: string, @Body() clockInDto: ClockInDto) {
    return this.attendanceService.clockIn(userId, clockInDto);
  }

  @Post('clock-out')
  clockOut(
    @CurrentUser('sub') userId: string,
    @Body() clockOutDto: ClockOutDto,
  ) {
    return this.attendanceService.clockOut(userId, clockOutDto);
  }

  @Get('today')
  getTodayAttendance(@CurrentUser('sub') userId: string) {
    return this.attendanceService.getTodayAttendance(userId);
  }

  @Get('summary')
  getSummary(
    @CurrentUser('sub') userId: string,
    @Query() queryDto: QueryAttendanceDto,
  ) {
    return this.attendanceService.getSummary(userId, queryDto);
  }

  @Get('all')
  @Roles('ADMIN')
  getAllAttendances(@Query() queryDto: QueryAttendanceDto) {
    return this.attendanceService.getAllAttendances(queryDto);
  }

  @Get(':id')
  getAttendanceById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.attendanceService.getAttendanceById(id, userId);
  }
}