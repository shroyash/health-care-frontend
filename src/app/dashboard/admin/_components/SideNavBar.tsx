"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Activity,
  Bell,
  FileText,
  Settings,
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
  { title: "Admin Dashboard", url: "/dashboard/admin", icon: LayoutDashboard, group: "Overview" },
  { title: "Appointments", url: "/dashboard/admin/appointments", icon: Calendar, group: "Management" },
  { title: "Doctors", url: "/dashboard/admin/doctors", icon: UserCheck, group: "Management" },
  { title: "Doctor Requests", url: "/dashboard/admin/doctors-requests", icon: FileText, group: "Management" },
  { title: "Patients", url: "/dashboard/admin/patients", icon: Users, group: "Management" },
  { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3, group: "Reports" },
  { title: "Reports", url: "/dashboard/admin/reports", icon: FileText, group: "Reports" },
  { title: "System Monitor", url: "/dashboard/admin/monitor", icon: Activity, group: "System" },
  { title: "Notifications", url: "/dashboard/admin/notifications", icon: Bell, group: "System" },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings, group: "System" },
];

// Group items by their "group"
const groupedItems = navigationItems.reduce((acc, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof navigationItems>);

export function AdminSidebar() {
  return (
    <Sidebar className="w-64 flex-shrink-0 border-r border-border bg-card">
      {/* Logo */}
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
