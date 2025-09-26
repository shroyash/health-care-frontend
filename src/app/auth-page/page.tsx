"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RoleSelector, UserRole } from "@/components/ui/RoleSelector";
import { ForgotPasswordModal } from "@/components/ui/ForgotPasswordModal";
import { Shield, Heart } from "lucide-react";
import Login from "./_components/Login";
import Register from "./_components/Register";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("patient");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const switchMode = (newMode: AuthMode) => setMode(newMode);

  return (
    <div className="min-h-screen bg-healthcare-subtle flex">
      {/* Left Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 lg:h-screen relative overflow-hidden sticky top-0">
        <div className="absolute inset-0 bg-blue-900/50"></div>
        <img
          src="./healthcare-hero.jpg"
          alt="Healthcare professionals"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          <h1 className="text-4xl font-bold mb-4 text-blue-200">
            Welcome to HealthCare
          </h1>
          <p className="text-xl text-blue-200 leading-relaxed">
            Connecting patients and doctors with modern, secure, and trusted healthcare solutions.
          </p>
        </div>
      </div>

      {/* Right Auth Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-md space-y-8 flex flex-col">
          {/* Header */}
          <div className="text-center flex-shrink-0">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-healthcare-gradient rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your healthcare portal"
                : "Join our trusted healthcare community"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-xl p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                mode === "login"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                mode === "register"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Form Section */}
          {mode === "login" ? (
            <Login
              setShowForgotPassword={setShowForgotPassword}
            />
          ) : (
            <Register role={role} setRole={setRole} />
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
