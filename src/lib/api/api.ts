import axios from "axios";
import { toast } from "react-toastify";

export interface ApiResponse<T> {
  status: boolean;
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

// ── 401 handling ──────────────────────────────────────────────────────────
// A page can fire several requests at once. If the account just got
// suspended (or the token is otherwise invalid), several of them can fail
// with 401 around the same moment. We only want to show ONE toast and
// redirect ONCE — and if any of those failures says "suspended", that
// message wins over a generic one.

let handled = false;
let sawSuspended = false;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

function handleAuthFailure(message: string) {
  if (handled || window.location.pathname.includes("/auth-page")) {
    return;
  }

  if (message.toLowerCase().includes("suspended")) {
    sawSuspended = true;
  }

  // Give other concurrent 401s a brief moment to report in, so a
  // "suspended" message arriving slightly later still wins.
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    if (handled) return;
    handled = true;

    localStorage.removeItem("user");
    toast.dismiss(); // clear any stray toasts before showing the final one

    if (sawSuspended) {
      toast.error(
        "Your account has been suspended. Contact support for more information.",
        { autoClose: 6000 }
      );
    } else {
      toast.error("Session expired. Please log in again.", {
        autoClose: 4000,
      });
    }

    setTimeout(() => {
      window.location.href = "/auth-page";
    }, sawSuspended ? 1500 : 1000);
  }, 150);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const message: string =
        error.response?.data?.error || error.response?.data?.message || "";
      handleAuthFailure(message);
    }
    return Promise.reject(error);
  }
);

export const API = {
  getOne: async <T>(endpoint: string): Promise<T> => {
    const res = await api.get<ApiResponse<T>>(endpoint);
    return res.data.data;
  },

  getAll: async <T>(endpoint: string): Promise<T[]> => {
    const res = await api.get<ApiResponse<T[]>>(endpoint);
    return res.data.data;
  },

  getById: async <T>(endpoint: string, id: string | number): Promise<T> => {
    const res = await api.get<ApiResponse<T>>(`${endpoint}/${id}`);
    return res.data.data;
  },

  create: async <Req, Res>(endpoint: string, data: Req): Promise<Res> => {
    const res = await api.post<ApiResponse<Res>>(endpoint, data);
    return res.data.data;
  },

  update: async <Req, Res>(
    endpoint: string,
    id: string | number,
    data: Req,
  ): Promise<Res> => {
    const res = await api.put<ApiResponse<Res>>(`${endpoint}/${id}`, data);
    return res.data.data;
  },

  putNoId: async <Req, Res>(endpoint: string, data: Req): Promise<Res> => {
    const res = await api.put<ApiResponse<Res>>(endpoint, data);
    return res.data.data;
  },

  patch: async <Req, Res>(endpoint: string, data: Req): Promise<Res> => {
    const res = await api.patch<ApiResponse<Res>>(endpoint, data);
    return res.data.data;
  },

  remove: async (endpoint: string, id: string | number): Promise<void> => {
    await api.delete(`${endpoint}/${id}`);
  },

  // ── POST action — no return data needed ──────────────────────────────────
  post: async <Req>(endpoint: string, data?: Req): Promise<void> => {
    await api.post(endpoint, data);
  },
};

export default api;