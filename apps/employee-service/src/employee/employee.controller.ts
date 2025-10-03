import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@libs/common';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.employeeService.create(createEmployeeDto, userId);
  }

  @Get()
  findAll(@Query() queryDto: QueryEmployeeDto) {
    return this.employeeService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.employeeService.update(id, updateEmployeeDto, userId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.employeeService.remove(id, userId);
  }
}