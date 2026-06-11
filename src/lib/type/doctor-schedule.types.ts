export interface DoctorScheduleResponseDto {
  doctorName: string;
  email: string;
  specialization: string;
  contactNumber: string;
  schedules: ScheduleInfo[];
}

export interface ScheduleInfo {
  scheduleId: number;
  scheduleDate: string; 
  dayOfWeek: string;
  startTime: string; 
  endTime: string; 
  available: boolean;
  isLocked: boolean;
  createdAt: string; 
  updatedAt: string; 
}

export interface DoctorScheduleDto {
  schedules: ScheduleDto[];
}

export interface ScheduleDto {
  scheduleDate: string;
  startTime: string;
  endTime: string;
  available: boolean;
}