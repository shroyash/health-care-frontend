import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Decode token (JWT) to get user role
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  const role = payload.role;

  const pathname = req.nextUrl.pathname;

  // Role-based route protection
  if (pathname.startsWith("/admin-dashboard") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/doctor-dashboard") && role !== "doctor") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/patient-dashboard") && role !== "patient") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

// Define which paths middleware should run on
export const config = {
  matcher: ["/admin-dashboard/:path*", "/doctor-dashboard/:path*", "/patient-dashboard/:path*"],
};
