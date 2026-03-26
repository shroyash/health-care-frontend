"use client";
import { useState } from "react";
import PatientSideNav from "./_Components/SideNavBar";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <PatientSideNav 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}  
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b bg-card/50">
          <button
            className="md:hidden text-2xl p-2"
            onClick={() => setSidebarOpen(true)}
          >
            &#9776;
          </button>
          <span className="text-sm text-muted-foreground">
            Healthcare Management System
          </span>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">Patient</span>
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-6 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}