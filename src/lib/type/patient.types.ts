export interface PatientProfileDTO {
  patientId: string;
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  profileImgUrl?: string;
  status: string;
}

export interface PatientProfileUpdateDto {
  fullName?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
}