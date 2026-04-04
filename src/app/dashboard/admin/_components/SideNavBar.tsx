"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Pill,
  LogOut,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/api/auth";

const navigationItems = [
  { title: "Admin Dashboard", url: "/dashboard/admin", icon: LayoutDashboard, group: "Overview" },
  { title: "Appointments", url: "/dashboard/admin/appointments", icon: Calendar, group: "Management" },
  { title: "Doctors", url: "/dashboard/admin/doctors", icon: UserCheck, group: "Management" },
  { title: "Doctor Requests", url: "/dashboard/admin/doctors-requests", icon: FileText, group: "Management" },
  { title: "Patients", url: "/dashboard/admin/patients", icon: Users, group: "Management" },
  { title: "Medicines Section", url: "/dashboard/admin/medicine", icon: Pill, group: "Management" },
  { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3, group: "Reports" },
  { title: "Reports", url: "/dashboard/admin/reports", icon: FileText, group: "Reports" },
];

const groupedItems = navigationItems.reduce((acc, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof navigationItems>);

export function AdminSidebar() {
  const { setOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <Sidebar className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-primary">HealthCare Admin</h2>
        <p className="text-base text-muted-foreground">Management System</p>
      </div>

      {/* Nav items — grows to fill space */}
      <SidebarContent className="px-4 flex-1 overflow-y-auto">
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-[1em] font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ title, url, icon: Icon }) => (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={url}
                        onClick={() => {
                          if (isMobile) setOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-[1.1em] text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Logout — pinned to bottom */}
      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[1.1em] text-destructive hover:bg-destructive/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </Sidebar>
  );
}