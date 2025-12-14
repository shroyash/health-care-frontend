"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useUserProfile } from "@/context/UserProfileContext";
import PatientSideNav from "./_Components/SideNavBar";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useUserProfile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">

        {/* Sidebar */}
        <div className="flex-none w-64">
          <PatientSideNav />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card/50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <span className="text-sm text-muted-foreground">
                Patient Portal
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Welcome,{" "}
              <span className="font-medium text-foreground">
                {loading ? "Loading..." : userProfile?.userName || "Guest"}
              </span>
            </p>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>

      </div>
    </SidebarProvider>
  );
}
