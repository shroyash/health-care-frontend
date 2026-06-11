"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth.api";
import { UserResponseDto } from "@/lib/type/auth.type";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}


export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ This returns only the inner data (UserResponse)
        const user  = await getCurrentUser();

        console.log("✅ Authenticated user:", user);

       const roles = user.roles;

        // ✅ Check if required role exists
        if (requiredRole && !roles.includes(requiredRole)) {
          console.warn(`Missing role: ${requiredRole}. Redirecting to /unauthorized`);
          router.push("/unauthorized");
          return;
        }

        setIsChecking(false);
      } catch (err) {
        console.error("❌ Auth check failed:", err);
        router.push("/auth-page");
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
