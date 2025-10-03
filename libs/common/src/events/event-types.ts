export enum EventPattern {
  PROFILE_UPDATED = 'profile.updated',
  PASSWORD_CHANGED = 'password.changed',
  PHOTO_UPDATED = 'photo.updated',
  PHONE_UPDATED = 'phone.updated',
  
  EMPLOYEE_CREATED = 'employee.created',
  EMPLOYEE_UPDATED = 'employee.updated',
  EMPLOYEE_DELETED = 'employee.deleted',
  
  ATTENDANCE_CLOCK_IN = 'attendance.clock_in',
  ATTENDANCE_CLOCK_OUT = 'attendance.clock_out',
}

export interface BaseEvent {
  userId: string;
  userName: string;
  eventType: EventPattern;
  eventAction: 'created' | 'updated' | 'deleted';
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ProfileUpdatedEvent extends BaseEvent {
  eventType: EventPattern.PROFILE_UPDATED;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface EmployeeCreatedEvent extends BaseEvent {
  eventType: EventPattern.EMPLOYEE_CREATED;
  employeeData: {
    id: string;
    email: string;
    name: string;
    position: string;
  };
}

export interface AttendanceEvent extends BaseEvent {
  eventType: EventPattern.ATTENDANCE_CLOCK_IN | EventPattern.ATTENDANCE_CLOCK_OUT;
  attendanceData: {
    id: string;
    date: Date;
    clockIn?: Date;
    clockOut?: Date;
  };
}