"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Shield,
  Settings,
  Activity,
  Bell,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, group: "Overview" },
  { title: "Appointments", url: "/appointments", icon: Calendar, group: "Management" },
  { title: "Doctors", url: "/doctors", icon: UserCheck, group: "Management" },
  { title: "Doctor Requests", url: "/doctor-requests", icon: FileText, group: "Management" },
  { title: "Patients", url: "/patients", icon: Users, group: "Management" },
  { title: "User Management", url: "/users", icon: Shield, group: "Management" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, group: "Reports" },
  { title: "Reports", url: "/reports", icon: FileText, group: "Reports" },
  { title: "System Monitor", url: "/monitor", icon: Activity, group: "System" },
  { title: "Notifications", url: "/notifications", icon: Bell, group: "System" },
  { title: "Settings", url: "/settings", icon: Settings, group: "System" },
];

const groupedItems = navigationItems.reduce((acc, item) => {
  // If this group doesn't exist yet, create an array
  if (!acc[item.group]) {
    acc[item.group] = [];
  }

  // Push the current item into its group
  acc[item.group].push(item);

  return acc; // always return the accumulator
}, {} as Record<string, typeof navigationItems>);


export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-border bg-card">
      {/* Logo / Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary">HealthCare Admin</h2>
        <p className="text-sm text-muted-foreground">Management System</p>
      </div>

      {/* Sidebar Navigation */}
      <SidebarContent className="px-4">
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ title, url, icon: Icon }) => (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
