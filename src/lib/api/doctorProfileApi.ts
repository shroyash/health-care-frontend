"use client";

import api from "./api";

export interface DoctorProfileUpdateDto {
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  workingAT: string;
  contactNumber: string;
}

export const getDoctorProfile = async (): Promise<DoctorProfileUpdateDto> => {
  const res = await api.get("/doctor-profiles/me"); 
  return res.data.data;
};

// Update doctor profile
export const updateDoctorProfile = async (data: DoctorProfileUpdateDto) => {
  const res = await api.put("/doctor-profiles", data);
  return res.data.data;
};
