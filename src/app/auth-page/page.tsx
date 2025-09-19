"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { RoleSelector, UserRole } from "@/components/ui/RoleSelector";
import { FileUpload } from "@/components/ui/FileUpload";
import { ForgotPasswordModal } from "@/components/ui/ForgotPasswordModal";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Shield, Heart } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { HealthcareButton } from "@/components/ui/healthcare-button";
import { registerUser, registerDoctor, loginUser } from "@/app/api/auth";

type AuthMode = "login" | "register";

interface AuthFormValues {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("patient");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>({ mode: "onSubmit" });

  const onSubmit = async (data: AuthFormValues) => {
    if (mode === "register" && role === "doctor" && !verificationFile) {
      setError("confirmPassword", {
        type: "manual",
        message: "Please upload your medical license or certification",
      });
      return;
    }

    if (mode === "register" && data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const res = await loginUser({ email: data.email!, password: data.password! });
        console.log("Login response:", res);
      } else if (mode === "register") {
        if (role === "doctor") {
          if (!verificationFile) return;

          const formData = new FormData();
          formData.append("username", data.fullName!);
          formData.append("email", data.email!);
          formData.append("password", data.password!);
          formData.append("license", verificationFile); // backend expects "license"

          const res = await registerDoctor(formData);
          console.log("Doctor registration response:", res);
        } else {
          const res = await registerUser({
            username: data.fullName!,
            email: data.email!,
            password: data.password!,
          });
          console.log("Patient registration response:", res);
        }
      }

      reset();
      setVerificationFile(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        alert(err.message);
      } else {
        console.error("Unknown error", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    reset();
    setVerificationFile(null);
  };

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
          <div className="mb-6">
            <Heart className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-blue-200">
            Welcome to HealthCare
          </h1>
          <p className="text-xl text-blue-200 leading-relaxed">
            Connecting patients and doctors with modern, secure, and trusted healthcare solutions.
          </p>
        </div>
      </div>

      {/* Right Form */}
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

          {/* Form */}
          <div className="flex-1 overflow-auto">
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <RoleSelector value={role} onChange={setRole} />
                  <Separator />

                  {mode === "register" && (
                    <FormInput
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      {...register("fullName", { required: "Full name is required" })}
                      icon={<User className="w-5 h-5" />}
                      error={errors.fullName?.message}
                    />
                  )}

                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                    })}
                    icon={<Mail className="w-5 h-5" />}
                    error={errors.email?.message}
                  />

                  <FormInput
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                    icon={<Lock className="w-5 h-5" />}
                    error={errors.password?.message}
                    showPasswordToggle
                  />

                  {mode === "register" && (
                    <FormInput
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm your password"
                      {...register("confirmPassword", { required: "Please confirm password" })}
                      icon={<Lock className="w-5 h-5" />}
                      error={errors.confirmPassword?.message}
                      showPasswordToggle
                    />
                  )}

                  {mode === "register" && role === "doctor" && (
                    <FileUpload
                      label="Medical License/Certification"
                      description="Upload your medical license or professional certification"
                      onChange={setVerificationFile}
                      error={errors.confirmPassword?.message}
                    />
                  )}

                  {mode === "login" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" {...register("rememberMe")} />
                        <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                          Remember me
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:text-primary-dark transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <HealthcareButton type="submit" loading={isLoading} className="w-full" size="lg">
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </HealthcareButton>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </div>
  );
}
