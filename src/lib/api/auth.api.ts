import { API } from "./api";
import {
  LoginRequest,
  UserResponseDto,
  RegisterUserRequest,
  ForgotPasswordRequest,
  VerifyResetTokenRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "../type/auth.type";
import { UserResponseCurrent } from "../type/auth.type";

export const authApi = {
  loginUserWeb: (data: LoginRequest) =>
    API.create<LoginRequest, UserResponseDto>("/api/auth/login-web", data),

  logout: () =>
    API.create<{}, void>("/api/auth/logout", {}),

  getCurrentUser: () =>
    API.getOne<UserResponseCurrent>("/api/auth/me"),

  registerPatient: (data: RegisterUserRequest) =>
    API.create<RegisterUserRequest, void>("/api/register/patient", data),

  registerDoctor: (data: FormData) =>
    API.create<FormData, void>("/api/register/doctor", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    API.create<ForgotPasswordRequest, void>("/api/auth/forget-password", data),

  verifyResetToken: (data: VerifyResetTokenRequest) =>
    API.create<VerifyResetTokenRequest, void>("/api/auth/verify-reset-token", data),

  resetPassword: (data: ResetPasswordRequest) =>
    API.create<ResetPasswordRequest, void>("/api/auth/reset-password", data),

  changePassword: (data: ChangePasswordRequest) =>
    API.create<ChangePasswordRequest, void>("/api/auth/change-password", data),
};


export const loginUserWeb = authApi.loginUserWeb;
export const logout = authApi.logout;
export const getCurrentUser = authApi.getCurrentUser;
export const registerUser = authApi.registerPatient;
export const registerDoctor = authApi.registerDoctor;
