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

export interface LoginResponse {
  message: string;
  status: string;
  data: UserResponseDto;
}
export interface Role {
  id: number;
  name: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  email: string;
}

export interface UserResponseDto {
  userName: string;
  email: string;
  role: Role[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  email: string;
  token: string; // NOT otp
}

export interface ResetPasswordRequest {
  email: string;
  token: string; // NOT otp
  newPassword: string;
}


export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

