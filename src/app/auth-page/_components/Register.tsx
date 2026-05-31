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
import { registerDoctor, registerUser } from "@/lib/api/auth.api";
import type { RegisterDoctorRequest } from "@/lib/type/auth.type";
import { toast } from "react-toastify";


interface RegisterProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

interface RegisterFormValues extends RegisterDoctorRequest {
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
  const [fileError, setFileError] = useState<string>("");  // ← separate file error state

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
        case 400: return data?.message || data?.error || "Invalid registration data.";
        case 409: return "An account with this email already exists.";
        case 422: return "Invalid data provided. Please check all fields.";
        case 413: return "File size too large. Max 5MB.";
        case 415: return "Invalid file type. Upload PDF, JPG, or PNG.";
        case 429: return "Too many attempts. Try again later.";
        case 500: return "Server error. Try again later.";
        default: return data?.message || data?.error || "Registration failed.";
      }
    }
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred. Please try again.";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    console.log("=== FORM SUBMITTED ===", data); // debug

    // Password match
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    if (data.password.length < 6) {
      setError("password", { message: "Password must be at least 6 characters" });
      return;
    }

    // Doctor file validation
    if (role === "doctor" && !verificationFile) {
      setFileError("Medical license is required");  // ← set error only on submit
      return;
    }

    if (verificationFile) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (verificationFile.size > maxSize) {
        setFileError("File size must be less than 5MB");
        return;
      }
      if (!allowedTypes.includes(verificationFile.type)) {
        setFileError("Please upload a PDF, JPG, or PNG file");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (role === "doctor") {
        const formData = new FormData();
        formData.append("username", data.username.trim());
        formData.append("email", data.email.trim().toLowerCase());
        formData.append("password", data.password);
        formData.append("gender", data.gender);
        formData.append("country", data.country.trim());
        formData.append("dateOfBirth", data.dateOfBirth);
        if (verificationFile) {
          formData.append("license", verificationFile);
        }
        await registerDoctor(formData);
        toast.info(
          "Your request has been sent to the admin. Please wait for approval.",
          { position: "top-center", autoClose: 5000 }
        );
      } else {
        await registerUser({
          username: data.username.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          gender: data.gender,
          country: data.country.trim(),
          dateOfBirth: data.dateOfBirth,
        });
        toast.success("Patient account created successfully! You can now login.", {
          position: "top-center",
          autoClose: 3000,
        });
      }

      reset();
      setVerificationFile(null);
      setFileError("");
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(getErrorMessage(err), { position: "top-center", autoClose: 5000 });
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

          {/* Full Name */}
          <FormInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            {...register("username", {
              required: "Full name is required",
              minLength: { value: 2, message: "Must be at least 2 characters" }
            })}
            icon={<User className="w-5 h-5" />}
            error={errors.username?.message}
          />

          {/* Email */}
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" }
            })}
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
          />

          {/* Password */}
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            showPasswordToggle
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword", { required: "Please confirm your password" })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.confirmPassword?.message}
            showPasswordToggle
          />

          {/* Date of Birth */}
          <FormInput
            label="Date of Birth"
            type="date"
            {...register("dateOfBirth", { required: "Date of Birth is required" })}
            error={errors.dateOfBirth?.message}
          />

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gender</label>
            <select
              {...register("gender", { required: "Gender is required" })}
              className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm transition-all duration-200 hover:border-primary/50 focus:outline-none focus:border-primary"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-healthcare-error">{errors.gender.message}</p>
            )}
          </div>

          {/* Country */}
          <FormInput
            label="Country"
            type="text"
            placeholder="Enter your country"
            {...register("country", {
              required: "Country is required",
              minLength: { value: 2, message: "Must be at least 2 characters" }
            })}
            error={errors.country?.message}
          />

          {/* File Upload - doctor only */}
          {role === "doctor" && (
            <FileUpload
              label="Medical License/Certification"
              description="Upload your license (PDF, JPG, PNG, max 5MB)"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(file: File | null) => {
                setVerificationFile(file);
                setFileError(""); // ← clear error when file selected
              }}
              error={fileError}  // ← only shows after submit attempt
            />
          )}

          {/* Submit */}
          <HealthcareButton
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </HealthcareButton>
        </form>
      </CardContent>
    </Card>
  );
}