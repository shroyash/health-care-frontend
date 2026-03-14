import { API } from "./api";
import type { Medicine, MedicineRequestDto } from "../type/medicine";

export const getAllMedicines = (): Promise<Medicine[]> =>
  API.getAll<Medicine>("/medicines");

export const getMedicineById = (id: number): Promise<Medicine> =>
  API.getById<Medicine>("/medicines", id);

export const addMedicine = (dto: MedicineRequestDto): Promise<Medicine> =>
  API.create<MedicineRequestDto, Medicine>("/medicines", dto);

export const updateMedicine = (id: number, dto: MedicineRequestDto): Promise<Medicine> =>
  API.update<MedicineRequestDto, Medicine>("/medicines", id, dto);

export const deleteMedicine = async (id: number): Promise<void> =>
  API.remove("/medicines", id);