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

export interface DoctorWithScheduleDto {
  doctorProfileId: string;
  name: string;
  profileUrl?: string;
  specialty: string;
  email?: string;
  phone?: string;
  schedules: ScheduleDto[];
}

export interface ScheduleDto {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

