// app/api/auth.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8003/auth"; 

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterDoctorRequest extends RegisterUserRequest {
   licenseFile?: File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterUserRequest) => {
  const response = await axios.post(`${API_BASE_URL}/register/patient`, data);
  return response.data;
};

// api/auth.ts
export const registerDoctor = async (data: FormData) => {
  const response = await axios.post(`${API_BASE_URL}/register/doctor`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


export const loginUser = async (data: LoginRequest) => {
  const response = await axios.post(`${API_BASE_URL}/login`, data);
  return response.data;
};
