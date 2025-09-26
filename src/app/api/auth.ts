// app/api/auth.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8003/auth"; 

// --- Types ---
export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterDoctorRequest extends RegisterUserRequest {
  license: string;
  licenseFile?: File; // file input (optional)
}

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Patients ---
export const registerUser = async (data: RegisterUserRequest) => {
  const response = await axios.post(`${API_BASE_URL}/register/patient`, data);
  return response.data;
};

// --- Doctors ---
export const registerDoctor = async (data: RegisterDoctorRequest) => {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("license", data.license);

  if (data.licenseFile) {
    formData.append("licenseFile", data.licenseFile);
  }

  const response = await axios.post(`${API_BASE_URL}/register/doctor`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// --- Login ---
export const loginUser = async (data: LoginRequest) => {
  const response = await axios.post(`${API_BASE_URL}/login`, data);
  return response.data;
};
