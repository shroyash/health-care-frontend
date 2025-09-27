// app/api/auth.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8003/auth";

// Configure axios instance with cookie support
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Enables cookie support
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for handling 401 errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Types ---
export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterDoctorRequest extends RegisterUserRequest {
  license: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  username: string;
  email: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  email: string;
}

export interface UserResponseDto {
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

// --- Registration ---
export const registerUser = async (data: RegisterUserRequest): Promise<UserResponseDto> => {
  const response = await authAxios.post('/register/patient', data);
  return response.data;
};

export const registerDoctor = async (data: RegisterDoctorRequest): Promise<RegisterDoctorRequest> => {

    // Simple JSON request
    const response = await authAxios.post('/register/doctor', {
      username: data.username,
      email: data.email,
      password: data.password,
      license: data.license,
    });
    return response.data;
  }


// Token-based login (for API clients)
export const loginUser = async (data: LoginRequest): Promise<JwtResponse> => {
  const response = await axios.post(`${API_BASE_URL}/login`, data);
  return response.data;
};

// Cookie-based login (for web clients) - RECOMMENDED
export const loginUserWeb = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await authAxios.post('/login-web', data);
  return response.data;
};

// Logout (clears cookies)
export const logout = async (): Promise<void> => {
  await authAxios.post('/logout');
};

// --- Password Management ---
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<string> => {
  const response = await authAxios.post('/forget-password', data);
  return response.data;
};

export const verifyResetToken = async (data: VerifyResetTokenRequest): Promise<string> => {
  const response = await authAxios.post('/verify-reset-token', data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
  const response = await authAxios.post('/reset-password', data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<string> => {
  const response = await authAxios.put('/users/me/change-password', data);
  return response.data;
};

// --- Utility Functions ---

// Check if user is authenticated
export const checkAuth = async (): Promise<boolean> => {
  try {
    // You'll need to create this endpoint in your backend
    await authAxios.get('/me');
    return true;
  } catch (error) {
    return false;
  }
};

// Get current user info
export const getCurrentUser = async (): Promise<unknown> => {
  try {
    // You'll need to create this endpoint in your backend
    const response = await authAxios.get('/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- For API calls outside of auth ---
export const createAuthenticatedAxios = () => {
  return axios.create({
    baseURL: 'http://localhost:8003', // Your main API base URL
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Export the configured axios instance for reuse
export { authAxios };