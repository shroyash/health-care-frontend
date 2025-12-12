"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getDoctorProfile } from "@/lib/api/doctorProfileApi";
import type { DoctorProfileUpdateDto } from "@/lib/api/doctorProfileApi";

const navigation = [
  { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
  { name: "Schedule", href: "/dashboard/doctor/schedule", icon: Calendar },
  { name: "Appointments", href: "/dashboard/doctor/appointments", icon: Clock },
  { name: "Patients", href: "/dashboard/doctor/patients", icon: Users },
  { name: "Reports", href: "/dashboard/doctor/reports", icon: FileText },
];

export default function SideNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfileUpdateDto | null>(null);

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

  if (!profile) {
    return <div className="h-screen p-6">Loading sidebar...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-card border-r border-border overflow-y-auto">
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

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
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

      {/* Footer / Profile */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar>
            <AvatarImage src="/doctor.png" />
            <AvatarFallback className="medical-gradient text-white bg-blue-600 border-2 p-2">
              DR
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-card-foreground">{profile.fullName}</p>
            <p className="text-sm text-muted-foreground">{profile.specialization}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => router.push("/dashboard/doctor/profile")}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}
