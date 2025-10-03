import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { EventPattern, BaseEvent } from '@libs/common/events';

@Processor('events')
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.debug(`Job ${job.id} completed!`);
  }

  @OnQueueFailed()
  onError(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`, error.stack);
  }

  // ============= PROFILE EVENTS =============

  @Process(EventPattern.PROFILE_UPDATED)
  async handleProfileUpdated(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.PROFILE_UPDATED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'PROFILE_UPDATE',
        eventAction: data.eventAction,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      const adminUsers = await this.notificationService.getAdminUsers();

      for (const admin of adminUsers) {
        const notification = await this.notificationService.create({
          recipientId: admin.id,
          senderId: data.userId,
          senderName: data.userName,
          type: 'PROFILE_UPDATED',
          title: 'Profile Updated',
          message: `${data.userName} has updated their profile`,
          metadata: {
            changes: data.newData,
            oldData: data.oldData,
          },
        });

        this.notificationGateway.sendToUser(admin.id, {
          type: 'notification',
          data: notification,
        });
      }

      this.logger.log(`Successfully processed profile update for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing profile update: ${error.message}`);
      throw error;
    }
  }

  @Process(EventPattern.PHOTO_UPDATED)
  async handlePhotoUpdated(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.PHOTO_UPDATED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'PHOTO_UPDATE',
        eventAction: data.eventAction,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      const adminUsers = await this.notificationService.getAdminUsers();

      for (const admin of adminUsers) {
        const notification = await this.notificationService.create({
          recipientId: admin.id,
          senderId: data.userId,
          senderName: data.userName,
          type: 'PHOTO_CHANGED',
          title: 'Photo Updated',
          message: `${data.userName} has updated their profile photo`,
          metadata: {
            photoUrl: data.newData?.photoUrl,
          },
        });

        this.notificationGateway.sendToUser(admin.id, {
          type: 'notification',
          data: notification,
        });
      }

      this.logger.log(`Successfully processed photo update for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing photo update: ${error.message}`);
      throw error;
    }
  }

  @Process(EventPattern.PHONE_UPDATED)
  async handlePhoneUpdated(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.PHONE_UPDATED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'PHONE_UPDATE',
        eventAction: data.eventAction,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      const adminUsers = await this.notificationService.getAdminUsers();

      for (const admin of adminUsers) {
        const notification = await this.notificationService.create({
          recipientId: admin.id,
          senderId: data.userId,
          senderName: data.userName,
          type: 'PHONE_UPDATED',
          title: 'Phone Number Updated',
          message: `${data.userName} has updated their phone number`,
          metadata: {
            oldPhone: data.oldData?.phone,
            newPhone: data.newData?.phone,
          },
        });

        this.notificationGateway.sendToUser(admin.id, {
          type: 'notification',
          data: notification,
        });
      }

      this.logger.log(`Successfully processed phone update for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing phone update: ${error.message}`);
      throw error;
    }
  }

  @Process(EventPattern.PASSWORD_CHANGED)
  async handlePasswordChanged(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.PASSWORD_CHANGED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'PASSWORD_CHANGE',
        eventAction: data.eventAction,
        oldData: null,
        newData: null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      this.logger.log(`Successfully processed password change for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing password change: ${error.message}`);
      throw error;
    }
  }

  // ============= EMPLOYEE EVENTS =============

  @Process(EventPattern.EMPLOYEE_CREATED)
  async handleEmployeeCreated(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.EMPLOYEE_CREATED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'EMPLOYEE_CREATED',
        eventAction: data.eventAction,
        oldData: null,
        newData: data.newData,
      });

      const adminUsers = await this.notificationService.getAdminUsers();

      for (const admin of adminUsers) {
        const notification = await this.notificationService.create({
          recipientId: admin.id,
          senderId: data.userId,
          senderName: data.userName,
          type: 'NEW_EMPLOYEE',
          title: 'New Employee Created',
          message: `New employee ${data.newData?.name || data.userName} has been added`,
          metadata: data.newData,
        });

        this.notificationGateway.sendToUser(admin.id, {
          type: 'notification',
          data: notification,
        });
      }

      this.logger.log(`Successfully processed employee creation: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing employee creation: ${error.message}`);
      throw error;
    }
  }

  @Process(EventPattern.EMPLOYEE_UPDATED)
  async handleEmployeeUpdated(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.EMPLOYEE_UPDATED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'EMPLOYEE_UPDATED',
        eventAction: data.eventAction,
        oldData: data.oldData,
        newData: data.newData,
      });

      const adminUsers = await this.notificationService.getAdminUsers();

      for (const admin of adminUsers) {
        const notification = await this.notificationService.create({
          recipientId: admin.id,
          senderId: data.userId,
          senderName: data.userName,
          type: 'EMPLOYEE_UPDATED',
          title: 'Employee Updated',
          message: `Employee ${data.userName} has been updated`,
          metadata: {
            changes: data.newData,
            oldData: data.oldData,
          },
        });

        this.notificationGateway.sendToUser(admin.id, {
          type: 'notification',
          data: notification,
        });
      }

      this.logger.log(`Successfully processed employee update: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing employee update: ${error.message}`);
      throw error;
    }
  }

  @Process(EventPattern.EMPLOYEE_DELETED)
  async handleEmployeeDeleted(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.EMPLOYEE_DELETED} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'EMPLOYEE_DELETED',
        eventAction: data.eventAction,
        oldData: data.oldData,
        newData: null,
      });

      const adminUsers = await this.notificationService.getAdminUsers();

      for (const admin of adminUsers) {
        const notification = await this.notificationService.create({
          recipientId: admin.id,
          senderId: data.userId,
          senderName: data.userName,
          type: 'EMPLOYEE_UPDATED',
          title: 'Employee Deleted',
          message: `Employee ${data.userName} has been deleted`,
          metadata: data.oldData,
        });

        this.notificationGateway.sendToUser(admin.id, {
          type: 'notification',
          data: notification,
        });
      }

      this.logger.log(`Successfully processed employee deletion: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing employee deletion: ${error.message}`);
      throw error;
    }
  }

  // ============= ATTENDANCE EVENTS =============

  @Process(EventPattern.ATTENDANCE_CLOCK_IN)
  async handleAttendanceClockIn(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.ATTENDANCE_CLOCK_IN} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'ATTENDANCE_CLOCK_IN',
        eventAction: data.eventAction,
        oldData: null,
        newData: data.newData,
      });

      this.logger.log(`Successfully processed clock in for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing clock in: ${error.message}`);
      throw error;
    }
  }

  @Process(EventPattern.ATTENDANCE_CLOCK_OUT)
  async handleAttendanceClockOut(job: Job<BaseEvent>) {
    this.logger.log(`Processing ${EventPattern.ATTENDANCE_CLOCK_OUT} event`);
    
    try {
      const { data } = job;

      await this.auditService.create({
        userId: data.userId,
        userName: data.userName,
        eventType: 'ATTENDANCE_CLOCK_OUT',
        eventAction: data.eventAction,
        oldData: null,
        newData: data.newData,
      });

      this.logger.log(`Successfully processed clock out for user ${data.userId}`);
    } catch (error) {
      this.logger.error(`Error processing clock out: ${error.message}`);
      throw error;
    }
  }
}