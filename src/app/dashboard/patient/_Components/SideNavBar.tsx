"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar, FileText, CalendarPlus,Pill } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPatientProfile } from "@/lib/api/patientProfileApi";
import type { PatientProfileDTO } from "@/lib/api/patientProfileApi";

const navigation = [
  { name: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
  { name: "Appointments", href: "/dashboard/patient/appointments", icon: Calendar },
  { name: "Request Appointment", href: "/dashboard/patient/request-appointments", icon: CalendarPlus },
  { name: "Appointments History", href: "/dashboard/patient/appointments-history", icon: Calendar },
   { name: "Medicines Section", href: "/dashboard/patient/medicine", icon: Pill },
  { name: "Report", href: "/dashboard/patient/report", icon: FileText },
];

export default function PatientSideNav({
  isOpen,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}) {
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

  const sidebarClasses = `
    fixed inset-y-0 left-0 w-64 bg-white border-r flex flex-col
    transform transition-transform duration-300 ease-in-out shadow-lg
    z-50 md:static md:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `;

  const overlayClasses = `
    fixed inset-0 bg-white z-40 md:hidden
    ${isOpen ? "block" : "hidden"}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className={overlayClasses} onClick={() => setIsOpen && setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="p-6 border-b flex flex-col items-center justify-center">
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
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition cursor-pointer ${
                    active ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen && setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
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
              <AvatarFallback className="bg-blue-600 text-white">{letter}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {loading ? "Loading..." : profile?.fullName || "Patient"}
              </p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/patient/profile")}
            className="w-full text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition"
          >
            View Profile
          </button>
        </div>
      </aside>
    </>
  );
}