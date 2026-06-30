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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MIN_AGE_YEARS = 18;

// Service is Nepal-only for now. Keep this as a single source of truth so
// expanding to other countries later is a one-line change.
const SUPPORTED_COUNTRIES = ["Nepal"] as const;
const DEFAULT_COUNTRY = "Nepal";

export default function Register({ role, setRole }: RegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [fileTouched, setFileTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    mode: "onBlur",
    defaultValues: {
      country: DEFAULT_COUNTRY,
    } as RegisterFormValues,
  });

  const password = watch("password");

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

  // Centralized file validation so it's reused for both "required" and "valid" checks
  const validateFile = (file: File | null): string => {
    if (role === "doctor" && !file) {
      return "Medical license is required";
    }
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return "File size must be less than 5MB";
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return "Please upload a PDF, JPG, or PNG file";
      }
    }
    return "";
  };

  const handleFileChange = (file: File | null) => {
    setVerificationFile(file);
    setFileTouched(true);
    setFileError(validateFile(file));
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // Doctor file validation runs on submit too, in case the user never
    // touched the upload control at all.
    const fileValidationError = validateFile(verificationFile);
    if (fileValidationError) {
      setFileTouched(true);
      setFileError(fileValidationError);
      return;
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
      setFileTouched(false);
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
              minLength: { value: 2, message: "Must be at least 2 characters" },
              maxLength: { value: 60, message: "Must be under 60 characters" },
              pattern: {
                value: /^[A-Za-z\s.'-]+$/,
                message: "Name can only contain letters, spaces, and ' . -",
              },
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
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email",
              },
              maxLength: { value: 254, message: "Email is too long" },
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
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              maxLength: { value: 72, message: "Password must be under 72 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: "Must include an uppercase letter, a lowercase letter, and a number",
              },
              onChange: () => {
                // Re-validate confirmPassword as the user edits password,
                // so a stale "match" or "mismatch" state doesn't linger.
                trigger("confirmPassword");
              },
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
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.confirmPassword?.message}
            showPasswordToggle
          />

          {/* Date of Birth */}
          <FormInput
            label="Date of Birth"
            type="date"
            {...register("dateOfBirth", {
              required: "Date of Birth is required",
              validate: (value) => {
                const dob = new Date(value);
                if (Number.isNaN(dob.getTime())) return "Enter a valid date";

                const today = new Date();
                if (dob > today) return "Date of birth cannot be in the future";

                let age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                  age--;
                }

                if (age < MIN_AGE_YEARS) return `You must be at least ${MIN_AGE_YEARS} years old`;
                if (age > 120) return "Enter a valid date of birth";

                return true;
              },
            })}
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

          {/* Country - Nepal only for now */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Country</label>
            <select
              {...register("country", {
                required: "Country is required",
                validate: (value) =>
                  SUPPORTED_COUNTRIES.includes(value as (typeof SUPPORTED_COUNTRIES)[number]) ||
                  "We currently only support registration from Nepal",
              })}
              className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm transition-all duration-200 hover:border-primary/50 focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Registration is currently available only for Nepal. More countries coming soon.
            </p>
            {errors.country && (
              <p className="text-sm text-healthcare-error">{errors.country.message}</p>
            )}
          </div>

          {/* File Upload - doctor only */}
          {role === "doctor" && (
            <FileUpload
              label="Medical License/Certification"
              description="Upload your license (PDF, JPG, PNG, max 5MB)"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              error={fileTouched ? fileError : ""}
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