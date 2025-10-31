// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt");

  // If no JWT cookie → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify user role from backend
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/auth/me`, {
    headers: { cookie: `jwt=${token.value}` },
    credentials: "include",
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const data = await res.json();
  const roles = data.data.roles;

  const path = req.nextUrl.pathname;

  // 🔒 Protect /dashboard/admin for ROLE_ADMIN
  if (path.startsWith("/dashboard/admin") && !roles.includes("ROLE_ADMIN")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 🔒 Protect /dashboard/doctor for ROLE_DOCTOR
  if (path.startsWith("/dashboard/doctor") && !roles.includes("ROLE_DOCTOR")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 🔒 Protect /dashboard/patient for ROLE_PATIENT
  if (path.startsWith("/dashboard/patient") && !roles.includes("ROLE_PATIENT")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // apply to everything under /dashboard
};
