
export interface DoctorProfileResponseDto {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  contactNumber: string;
  profileImage?: string;
  status: string;
}

export interface DoctorWithScheduleDto {
  doctorProfileId: string;
  name: string;
  profileUrl?: string;
  specialty: string;
  email: string;
  phone: string;
  schedules: ScheduleDto[];
}

export interface ScheduleDto {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorScheduleDto {
  date: string;
  startTime: string;
  endTime: string;
}

export interface DoctorScheduleUpdateDTO {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorScheduleResponseDto {
  doctorProfileId: string;
  doctorName: string;
  schedules: ScheduleDto[];
}