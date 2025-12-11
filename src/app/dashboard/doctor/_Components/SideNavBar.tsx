"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
  { name: "Schedule", href: "/dashboard/doctor/schedule", icon: Calendar },
  { name: "Appointments", href: "/dashboard/doctor/appointments", icon: Clock },
  { name: "Patients", href: "/dashboard/doctor/patients", icon: Users },
  { name: "Reports", href: "/dashboard/doctor/reports", icon: FileText },
];

export default function SideNavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="h-screen flex flex-col bg-card border-r border-border overflow-y-auto">
      {/* Logo + Title */}
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

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Doctor Profile */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarImage src="/doctor.png" />
            <AvatarFallback className="medical-gradient text-primary-foreground">
              DR
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-card-foreground">Dr. Sarah Johnson</p>
            <p className="text-sm text-muted-foreground">Cardiologist</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
