import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaMainService } from '@libs/prisma-main';
import { HashUtil, PaginatedResult } from '@libs/common';
import { EventPattern } from '@libs/common/events';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly prisma: PrismaMainService,
    @InjectQueue('events') private eventsQueue: Queue,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, createdBy: string) {
    const { email, password, name, position, phone, photoUrl } = createEmployeeDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await HashUtil.hash(password);

    const employee = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        position,
        phone,
        photoUrl,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Employee created: ${employee.email} by user ${createdBy}`);

    await this.eventsQueue.add(EventPattern.EMPLOYEE_CREATED, {
      userId: employee.id,
      userName: employee.name,
      eventType: EventPattern.EMPLOYEE_CREATED,
      eventAction: 'created',
      newData: employee,
      timestamp: new Date(),
    });

    return employee;
  }

  async findAll(queryDto: QueryEmployeeDto): Promise<PaginatedResult<any>> {
    const { page, limit, search, position, role } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (position) {
      where.position = { contains: position, mode: 'insensitive' };
    }

    if (role) {
      where.role = role;
    }

    const total = await this.prisma.user.count({ where });

    const employees = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: employees,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, updatedBy: string) {
    const existingEmployee = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== existingEmployee.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateEmployeeDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedEmployee = await this.prisma.user.update({
      where: { id },
      data: updateEmployeeDto,
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Employee updated: ${updatedEmployee.email} by user ${updatedBy}`);

    await this.eventsQueue.add(EventPattern.EMPLOYEE_UPDATED, {
      userId: updatedEmployee.id,
      userName: updatedEmployee.name,
      eventType: EventPattern.EMPLOYEE_UPDATED,
      eventAction: 'updated',
      oldData: existingEmployee,
      newData: updatedEmployee,
      timestamp: new Date(),
    });

    return updatedEmployee;
  }

  async remove(id: string, deletedBy: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`Employee deleted: ${employee.email} by user ${deletedBy}`);

    await this.eventsQueue.add(EventPattern.EMPLOYEE_DELETED, {
      userId: employee.id,
      userName: employee.name,
      eventType: EventPattern.EMPLOYEE_DELETED,
      eventAction: 'deleted',
      oldData: employee,
      timestamp: new Date(),
    });

    return {
      message: 'Employee deleted successfully',
    };
  }
}