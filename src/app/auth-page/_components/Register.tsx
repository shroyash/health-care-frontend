"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/ui/form-input";
import { FileUpload } from "@/components/ui/FileUpload";
import { HealthcareButton } from "@/components/ui/healthcare-button";
import { RoleSelector, UserRole } from "@/components/ui/RoleSelector";
import { registerDoctor, registerUser } from "@/lib/api/auth";
import type { RegisterDoctorRequest } from "@/lib/type/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RegisterProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

interface RegisterFormValues extends RegisterDoctorRequest{
  confirmPassword: string;
}

interface ErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      details?: string;
    };
  };
  message?: string;
}

export default function Register({ role, setRole }: RegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>();

  const getErrorMessage = (error: ErrorResponse | Error | unknown): string => {
    if (error && typeof error === "object" && "response" in error) {
      const err = error as ErrorResponse;
      const status = err.response?.status;
      const data = err.response?.data;

      switch (status) {
        case 400:
          if (data?.message?.toLowerCase().includes("email")) {
            return "Invalid email format. Please enter a valid email address.";
          }
          if (data?.message?.toLowerCase().includes("password")) {
            return "Password does not meet requirements. Use at least 6 characters.";
          }
          return data?.message || data?.error || "Invalid registration data. Please check your inputs.";
        case 409:
          return "An account with this email already exists. Please login or use a different email.";
        case 422:
          return "Invalid data provided. Please check all fields and try again.";
        case 413:
          return "File size too large. Please upload a smaller file (max 5MB).";
        case 415:
          return "Invalid file type. Please upload a PDF, JPG, or PNG file.";
        case 429:
          return "Too many registration attempts. Please try again later.";
        case 500:
          return "Server error. Please try again later.";
        case 503:
          return "Service temporarily unavailable. Please try again later.";
        default:
          return data?.message || data?.error || data?.details || "Registration failed. Please try again.";
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Network") || error.message.includes("fetch")) {
        return "Network error. Please check your internet connection and try again.";
      }
      if (error.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }
      return error.message;
    }

    return "An unexpected error occurred. Please try again.";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // Client-side validation
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    if (data.password.length < 6) {
      setError("password", { message: "Password must be at least 6 characters long" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("email", { message: "Please enter a valid email address" });
      return;
    }

    if (data.username.trim().length < 2) {
      setError("username", { message: "Full name must be at least 2 characters long" });
      return;
    }

    if (role === "doctor" && !verificationFile) {
      toast.error("Please upload your medical license or certification", { position: "top-center" });
      return;
    }

    if (verificationFile) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

      if (verificationFile.size > maxSize) {
        toast.error("File size must be less than 5MB", { position: "top-center" });
        return;
      }

      if (!allowedTypes.includes(verificationFile.type)) {
        toast.error("Please upload a PDF, JPG, or PNG file", { position: "top-center" });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (role === "doctor") {
        await registerDoctor(data, verificationFile!); // send FormData
        toast.info(
          "Your request has been sent to the admin. Please wait for approval.",
          { position: "top-center", autoClose: 5000 }
        );
      } else {
        await registerUser({
          username: data.username.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });
        toast.success("Patient account created successfully! You can now login.", {
          position: "top-center",
          autoClose: 3000,
        });
      }

      reset();
      setVerificationFile(null);
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage, { position: "top-center", autoClose: 5000 });

      if (errorMessage.toLowerCase().includes("email")) {
        setError("email", { message: "This email is already registered. Please use a different email or login." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <RoleSelector value={role} onChange={setRole} />
          <Separator />

          <FormInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            {...register("username", {
              required: "Full name is required",
              minLength: { value: 2, message: "Full name must be at least 2 characters" },
              pattern: { value: /^[a-zA-Z\s]+$/, message: "Full name can only contain letters and spaces" },
            })}
            icon={<User className="w-5 h-5" />}
            error={errors.username?.message}
          />

          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
            })}
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password (min. 6 characters)"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            showPasswordToggle
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword", { required: "Please confirm password" })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.confirmPassword?.message}
            showPasswordToggle
          />

          {role === "doctor" && (
            <FileUpload
              label="Medical License/Certification"
              description="Upload your medical license or professional certification (PDF, JPG, or PNG, max 5MB)"
              onChange={setVerificationFile}
              error={verificationFile ? undefined : "Medical license is required for doctor registration"}
            />
          )}

          <HealthcareButton type="submit" loading={isLoading} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? "Creating Account..." : "Create Account"}
          </HealthcareButton>
        </form>
      </CardContent>
    </Card>
  );
}
