"use client";
import { useUserProfile } from "@/context/UserProfileContext";

interface UserState {
  userId:   string;
  username: string;
  isDoctor: boolean;
  ready:    boolean;
}

export function useCurrentUser(): UserState {
  const { userProfile, loading } = useUserProfile(); // ✅ already fetched by provider

  if (loading || !userProfile) {
    return { userId: "", username: "", isDoctor: false, ready: false };
  }

  const roles    = Array.isArray(userProfile.roles) ? userProfile.roles : [];
  const isDoctor = roles.includes("ROLE_DOCTOR");

  return {
    userId:   String(userProfile.userId ?? ""),
    username: userProfile.username ?? "",
    isDoctor,
    ready:    true,
  };
}