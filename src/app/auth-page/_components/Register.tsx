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
          return data?.message || data?.error || "Invalid registration data.";
        case 409:
          return "An account with this email already exists.";
        case 422:
          return "Invalid data provided. Please check all fields.";
        case 413:
          return "File size too large. Max 5MB.";
        case 415:
          return "Invalid file type. Upload PDF, JPG, or PNG.";
        case 429:
          return "Too many attempts. Try again later.";
        case 500:
          return "Server error. Try again later.";
        default:
          return data?.message || data?.error || "Registration failed.";
      }
    }

    if (error instanceof Error) return error.message;

    return "An unexpected error occurred. Please try again.";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // Password validation
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    if (data.password.length < 6) {
      setError("password", { message: "Password must be at least 6 characters" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("email", { message: "Enter a valid email address" });
      return;
    }

    if (data.username.trim().length < 2) {
      setError("username", { message: "Full name must be at least 2 characters" });
      return;
    }

    if (!data.dateOfBirth) {
      setError("dateOfBirth", { message: "Date of Birth is required" });
      return;
    }

    if (!data.gender) {
      setError("gender", { message: "Gender is required" });
      return;
    }

    if (!data.country || data.country.trim().length < 2) {
      setError("country", { message: "Country must be at least 2 characters" });
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
        await registerDoctor(data, verificationFile!); // Send FormData including dob, gender, country
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
          country: data.country,
          dateOfBirth: data.dateOfBirth,
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
            {...register("username", { required: "Full name is required" })}
            icon={<User className="w-5 h-5" />}
            error={errors.username?.message}
          />

          {/* Email */}
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
          />

          {/* Password */}
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            showPasswordToggle
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword", { required: "Confirm password" })}
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
          <select
            {...register("gender", { required: "Gender is required" })}
            className="w-full border rounded p-2"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}

          {/* Country */}
          <FormInput
            label="Country"
            type="text"
            placeholder="Enter your country"
            {...register("country", { required: "Country is required" })}
            error={errors.country?.message}
          />

       {role === "doctor" && (
  <FileUpload
    label="Medical License/Certification"
    description="Upload your license (PDF, JPG, PNG, max 5MB)"
    onChange={(file: File | null) => {
      console.log("Selected file:", file); // debug to confirm it's a real File
      setVerificationFile(file);
    }}
    error={verificationFile ? undefined : "Medical license is required"}
  />
)}


          {/* Submit Button */}
          <HealthcareButton type="submit" loading={isLoading} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? "Creating Account..." : "Create Account"}
          </HealthcareButton>
        </form>
      </CardContent>
    </Card>
  );
}
