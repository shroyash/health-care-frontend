"use client"; // ⚡ Must be a client component

import { 
  Calendar, 
  CalendarPlus, 
  FileText, 
  User, 
  LayoutDashboard,
  Activity
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/context/UserProfileContext";
import { usePathname } from "next/navigation"; // for active section

const navigation = [
  { name: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
  { name: "Appointments", href: "/dashboard/patient/appointments", icon: Calendar },
  { name: "Request Appointments", href: "/dashboard/patient/request-appointments", icon: CalendarPlus },
  { name: "History", href: "/dashboard/patient/history", icon: FileText },
  { name: "Profile", href: "/dashboard/patient/profile", icon: User },
];

export function AppSidebar() {
  const { userProfile, loading } = useUserProfile();
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-card shadow-soft">
      <SidebarHeader className="p-6 border-b border-border">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">MediCare</h2>
            <p className="text-sm text-muted-foreground">Patient Portal</p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 mt-4 p-3 bg-accent rounded-lg">
          <Avatar className="h-10 w-10">
            {/* <AvatarImage src={userProfile?.avatarUrl || ""} alt={userProfile?.username || "Patient"} /> */}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userProfile?.data.username ? userProfile.data.username: "JD"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {loading ? "Loading..." : userProfile?.data.username || "Guest"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <Link href={item.href} passHref>
                      <SidebarMenuButton
                        className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
