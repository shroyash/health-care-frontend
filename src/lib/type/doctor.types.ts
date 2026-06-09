export interface DoctorProfileResponseDto {
  doctorProfileId: string;
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  workingAT: string;
  contactNumber: string;
  profileImg?: string;
  profileImgUrl?: string;
  status: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
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

export interface DoctorProfileUpdateDto {
  fullName?: string;
  specialization?: string;
  yearsOfExperience?: number;
  workingAT?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  email?: string;
}

export interface DoctorAppointment {
  appointmentId: number;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkupType: string;
  meetingLink?: string;
  status: string;
}