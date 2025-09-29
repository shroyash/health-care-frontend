"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  LayoutDashboard,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
  { name: "Schedule", href: "/doctor-dashboard/schedule", icon: Calendar },
  { name: "Appointments", href: "/doctor-dashboard/appointments", icon: Clock },
  { name: "Patients", href: "/doctor-dashboard/patients", icon: Users },
  { name: "Reports", href: "/doctor-dashboard/reports", icon: FileText },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/doctor-dashboard") return pathname === "/doctor-dashboard";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
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
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-[var(--transition-smooth)] ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                    : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Doctor Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="medical-gradient text-primary-foreground">
                DR
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                {navigation.find(nav => isActive(nav.href))?.name || "Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                Manage your practice efficiently
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                3 New
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
