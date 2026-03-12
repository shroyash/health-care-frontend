"use client";

import { useState } from "react";
import PatientSideNav from "./_Components/SideNavBar";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <PatientSideNav isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b bg-card/50">
          {/* Hamburger only on mobile */}
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
        <main className="flex-1 overflow-auto">
          {/* Removed max-w-7xl to make full width */}
          <div className="px-4 sm:px-6 py-6 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}