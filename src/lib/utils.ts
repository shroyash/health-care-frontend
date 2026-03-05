import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCurrentUser } from "./api/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ts?: string): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ─── Matches UserResponseDto exactly ─────────────────────────────────────────
// userId: UUID  → string
// username: String
// email: String
// roles: Set<String> → string[]

export interface CurrentUser {
  userId:   string;        // UUID as string e.g. "9cd8afbf-..."
  username: string;
  email:    string;
  roles:    string[];      // e.g. ["ROLE_DOCTOR"] or ["ROLE_PATIENT"]
}

let cachedUser: CurrentUser | null = null;

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (cachedUser) return cachedUser;
  try {
    const data = await getCurrentUser();
    console.log(data) // calls /users/auth/me
    cachedUser = {
      userId:   String(data.userId ?? ""),
      username: data.username ?? "",
      email:    data.email    ?? "",
      roles:    Array.isArray(data.roles)
                  ? data.roles
                  : typeof data.roles === "string"
                    ? [data.roles]
                    : [],
    };
    console.log("=== fetchCurrentUser ===", cachedUser); // remove after confirming
    return cachedUser;
  } catch (err) {
    console.error("fetchCurrentUser failed:", err);
    return null;
  }
}

export function clearUserCache() {
  cachedUser = null;
}

// ─── Sync helpers — only valid after fetchCurrentUser() resolves ──────────────
export function extractUserIdFromCookie():   string { return cachedUser?.userId   ?? ""; }
export function extractUsernameFromCookie(): string { return cachedUser?.username ?? ""; }
export function extractUserRoleFromCookie(): string {
  const roles = cachedUser?.roles ?? [];
  if (roles.includes("ROLE_DOCTOR"))  return "DOCTOR";
  if (roles.includes("ROLE_PATIENT")) return "PATIENT";
  return "";
} 