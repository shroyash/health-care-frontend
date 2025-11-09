"use client";

import { useState, useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate async auth check
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return <>{children}</>;
}
