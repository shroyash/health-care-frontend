"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  LayoutDashboard,
  X,
  Pi,
  Pill,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getDoctorProfile } from "@/lib/api/doctorProfileApi";
import type { DoctorProfileDTO } from "@/lib/api/doctorProfileApi";
import { logout } from "@/lib/api/auth";

interface SideNavBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
  { name: "Schedule", href: "/dashboard/doctor/schedule", icon: Calendar },
  { name: "Appointments", href: "/dashboard/doctor/appointments", icon: Clock },
  { name: "Appointments Request", href: "/dashboard/doctor/appointments-request", icon: Clock },
  { name: "Appointments History", href: "/dashboard/doctor/appointments-history", icon: Calendar },
  { name: "Medicine Section", href: "/dashboard/doctor/medicine", icon: Pill },
  { name: "Reports", href: "/dashboard/doctor/report", icon: FileText },
];

export default function SideNavBar({ isOpen, toggleSidebar }: SideNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfileDTO | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDoctorProfile();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/auth-page");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!profile) return <div className="h-screen p-6">Loading sidebar...</div>;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="medical-gradient w-10 h-10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground">Doctor Portal</h2>
              <p className="text-sm text-muted-foreground">Medical Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleSidebar}
            >
              <div
                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer/Profile at bottom */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarImage
                src={
                  profile.profileImgUrl
                    ? `http://localhost:8004${profile.profileImgUrl}`
                    : undefined
                }
              />
              <AvatarFallback className="medical-gradient text-white bg-blue-600 border-2 p-2">
                {profile.fullName
                  ? profile.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "DR"}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-card-foreground text-center">
              {profile.fullName}
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {profile.specialization}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                router.push("/dashboard/doctor/profile");
                toggleSidebar();
              }}
            >
              View Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}