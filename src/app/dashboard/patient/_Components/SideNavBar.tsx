"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CalendarPlus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { getPatientProfile } from "@/lib/api/patientProfileApi";
import type { PatientProfileDTO } from "@/lib/api/patientProfileApi";

const navigation = [
  { name: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
  { name: "Appointments", href: "/dashboard/patient/appointments", icon: Calendar },
  { name: "Request Appointment", href: "/dashboard/patient/request-appointments", icon: CalendarPlus },
  { name: "History", href: "/dashboard/patient/history", icon: FileText },
];

export default function PatientSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const letter = profile?.email?.charAt(0).toUpperCase() || "P";

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">MediCare</h2>
        <p className="text-sm text-gray-500">Patient Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">
              {letter}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {loading ? "Loading..." : profile?.fullName || "Patient"}
            </p>
            <p className="text-xs text-gray-500">Patient</p>
          </div>
        </div>

        {/* View Profile Button */}
        <button
          onClick={() => router.push("/dashboard/patient/profile")}
          className="w-full text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition"
        >
          View Profile
        </button>
      </div>
    </aside>
  );
}
