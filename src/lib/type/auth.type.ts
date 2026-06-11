export type Gender = 'MALE' | 'FEMALE'

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  gender: Gender;
  country: string;
  dateOfBirth: string;
}


export interface RegisterDoctorRequest extends RegisterUserRequest {
  license?: File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface UserResponseDto {
  userId: string;
  username: string;
  email: string;
  role: Role[];
}

export interface UserResponseCurrent {
  userId: string;
  username: string;
  email: string;
  roles: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}


export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}