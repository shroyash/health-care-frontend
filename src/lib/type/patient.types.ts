// types/patient.types.ts
export interface PatientsStats {
  activePatients: number;
  totalPatients: number;
  totalCompletedAppointments: number;
}

export interface GenderCountResponseDto {
  male: number;
  female: number;
}