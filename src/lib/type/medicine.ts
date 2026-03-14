export interface Medicine {
  id: number;
  name: string;
  description: string;
  dosage: string;
  category: string;
  sideEffects: string;
  manufacturer: string;
  addedByDoctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRequestDto {
  name: string;
  description: string;
  dosage: string;
  category: string;
  sideEffects: string;
  manufacturer: string;
}