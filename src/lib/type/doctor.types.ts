export interface DoctorProfileResponseDto {
  doctorProfileId: string;
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  workingAT: string;
  contactNumber: string;
  profileImgUrl?: string;
  status: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
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