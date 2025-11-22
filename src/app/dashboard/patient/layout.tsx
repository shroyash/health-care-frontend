"use client";

import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_Components/SideNavBar";
import { useUserProfile } from "@/context/UserProfileContext";
import { log } from "console";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useUserProfile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        
        {/* Sidebar */}
        <div className="flex-none w-64">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="text-sm text-muted-foreground">
                Healthcare
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{loading ? "Loading..." : userProfile?.data.username || "Guest"}</span>
              </p>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>

      </div>
    </SidebarProvider>
  );
}
