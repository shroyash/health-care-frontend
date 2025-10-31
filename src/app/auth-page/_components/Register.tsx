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
import { registerDoctor,registerUser } from "@/lib/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RegisterProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
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
    // Type guard for ErrorResponse
    if (error && typeof error === "object" && "response" in error) {
      const err = error as ErrorResponse;
      const status = err.response?.status;
      const data = err.response?.data;

      switch (status) {
        case 400:
          // Check for specific validation errors
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

    // Type guard for Error
    if (error instanceof Error) {
      if (error.message.includes("Network") || error.message.includes("fetch")) {
        return "Network error. Please check your internet connection and try again.";
      }
      if (error.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }
      return error.message;
    }

    // Default error message
    return "An unexpected error occurred. Please try again.";
  };

  // Helper to convert file -> base64 string
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onSubmit = async (data: RegisterFormValues) => {
    // Client-side validation
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    // Validate password strength
    if (data.password.length < 6) {
      setError("password", { 
        message: "Password must be at least 6 characters long" 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("email", { 
        message: "Please enter a valid email address" 
      });
      return;
    }

    // Validate full name
    if (data.fullName.trim().length < 2) {
      setError("fullName", { 
        message: "Full name must be at least 2 characters long" 
      });
      return;
    }

    // Validate doctor file upload
    if (role === "doctor" && !verificationFile) {
      toast.error("Please upload your medical license or certification", {
        position: "top-center",
      });
      return;
    }

    // Validate file size and type
    if (verificationFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (verificationFile.size > maxSize) {
        toast.error("File size must be less than 5MB", {
          position: "top-center",
        });
        return;
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(verificationFile.type)) {
        toast.error("Please upload a PDF, JPG, or PNG file", {
          position: "top-center",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (role === "doctor") {
        let base64String = "";
        
        if (verificationFile) {
          try {
            base64String = await fileToBase64(verificationFile);
          } catch (fileError) {
            console.error("File conversion error:", fileError);
            toast.error("Failed to process file. Please try again.", {
              position: "top-center",
            });
            setIsLoading(false);
            return;
          }
        }

        const payload = {
          username: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          license: base64String || "file",
        };

        console.log("Doctor registration payload:", { ...payload, license: "..." });

        await registerDoctor(payload);

        toast.info(
          "Your request has been sent to the admin. Please wait for approval. You will receive an email once your account is approved.",
          { position: "top-center", autoClose: 5000 }
        );

        reset();
        setVerificationFile(null);
      } else {
        const payload = {
          username: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        };

        console.log("Patient registration payload:", payload);

        await registerUser(payload);

        toast.success("Patient account created successfully! You can now login.", {
          position: "top-center",
          autoClose: 3000,
        });

        reset();
      }
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage = getErrorMessage(err);
      
      // Show specific error message
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });

      // Set form errors for specific fields if applicable
      if (errorMessage.toLowerCase().includes("email already exists") || 
          errorMessage.toLowerCase().includes("email")) {
        setError("email", { 
          message: "This email is already registered. Please use a different email or login." 
        });
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
            {...register("fullName", { 
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters"
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: "Full name can only contain letters and spaces"
              }
            })}
            icon={<User className="w-5 h-5" />}
            error={errors.fullName?.message}
          />

          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address"
              }
            })}
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password (min. 6 characters)"
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            showPasswordToggle
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword", {
              required: "Please confirm password",
            })}
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