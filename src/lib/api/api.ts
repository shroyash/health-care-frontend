// lib/api.ts
import axios from "axios";

// Generic backend response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && typeof window !== "undefined") {
//       console.log("API 401 Unauthorized - redirecting to /auth-page");
//       // Only redirect if NOT already on auth-page
//       if (!window.location.pathname.includes("/auth-page")) {
//         window.location.href = "/auth-page";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export const API = {
  // GET single item
  getOne: async <T>(endpoint: string): Promise<T> => {
    const res = await api.get<ApiResponse<T>>(endpoint);
    return res.data.data;
  },

  // GET list
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    const res = await api.get<ApiResponse<T[]>>(endpoint);
    return res.data.data;
  },

  // GET by ID
  getById: async <T>(endpoint: string, id: string | number): Promise<T> => {
    const res = await api.get<ApiResponse<T>>(`${endpoint}/${id}`);
    return res.data.data;
  },

  // POST
  create: async <Req, Res>(endpoint: string, data: Req): Promise<Res> => {
    const res = await api.post<ApiResponse<Res>>(endpoint, data);
    return res.data.data;
  },

  // PUT / update
  update: async <Req, Res>(endpoint: string, id: string | number, data: Req): Promise<Res> => {
    const res = await api.put<ApiResponse<Res>>(`${endpoint}/${id}`, data);
    return res.data.data;
  },

  // PUT /update without ID
putNoId: async <Req, Res>(endpoint: string, data: Req): Promise<Res> => {
  const res = await api.put<ApiResponse<Res>>(endpoint, data);
  return res.data.data;
},


   patch: async <Req, Res>(endpoint: string, data: Req): Promise<Res> => {
    const res = await api.patch<ApiResponse<Res>>(endpoint, data);
    return res.data.data;
  },

  // DELETE
  remove: async (endpoint: string, id: string | number): Promise<void> => {
    await api.delete(`${endpoint}/${id}`);
  },
};

export default api;
