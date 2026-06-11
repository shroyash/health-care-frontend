
export interface PatientProfileDTO {
  patientProfileId: string;
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  profileImage?: string;
  status: string;
}

export interface PatientProfileUpdateDto {
  fullName?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
}