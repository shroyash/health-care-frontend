"use client";
import api from "./api"; 

import type {
  RegisterUserRequest,
  RegisterDoctorRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyResetTokenRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserResponseDto,
  UserResponse,
} from "../type/auth"; 

// --- Auth APIs ---
export const registerUser = async (data: RegisterUserRequest): Promise<UserResponseDto> => {
  const res = await api.post("/auth/register/patient", data);
  return res.data;
};

export const registerDoctor = async (data: RegisterDoctorRequest, file: File) => {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("license", file); 

  const res = await api.post("/auth/register/doctor", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const loginUserWeb = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/auth/login-web", data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<string> => {
  const res = await api.post("/auth/forget-password", data);
  return res.data;
};

export const verifyResetToken = async (data: VerifyResetTokenRequest): Promise<string> => {
  const res = await api.post("/auth/verify-reset-token", data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<string> => {
  const res = await api.put("/auth/users/me/change-password", data);
  return res.data;
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    await api.get("/auth/me");
    return true;
  } catch {
    return false;
  }
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const res = await api.get("/users/auth/me");
  return res.data;
};
