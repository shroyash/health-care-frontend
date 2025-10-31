"use client";

import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form-input";
import { HealthcareButton } from "@/components/ui/healthcare-button";
import { loginUserWeb } from "@/lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface LoginProps {
  setShowForgotPassword: (val: boolean) => void;
}

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  status?: number;
}

export default function Login({ setShowForgotPassword }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>();

  const getErrorMessage = (error: unknown): string => {
    // Handle Axios errors specifically
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data as ApiErrorResponse | undefined;

      console.log("Axios error details:", {
        status,
        data,
        message: error.message,
      });

      switch (status) {
        case 400:
          return data?.message || data?.error || "Invalid email or password format.";
        case 401:
        case 403:
          // Treat both 401 and 403 as authentication failures
          const message = data?.message || data?.error || "";
          
          // Check for specific account status issues
          if (message.toLowerCase().includes("disabled")) {
            return "Your account has been disabled. Please contact support.";
          }
          if (message.toLowerCase().includes("locked")) {
            return "Your account has been locked due to multiple failed login attempts. Please try again later or reset your password.";
          }
          if (message.toLowerCase().includes("verify") || message.toLowerCase().includes("verification")) {
            return "Please verify your email address before logging in. Check your inbox for the verification link.";
          }
          if (message.toLowerCase().includes("approved") || message.toLowerCase().includes("pending")) {
            return "Your account is pending approval. Please wait for an administrator to approve your account.";
          }
          if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("no user")) {
            return "No account found with this email address. Please check your email or sign up.";
          }
          
          // Default authentication error - most common for wrong credentials
          return "Invalid email or password. Please check your credentials and try again.";
        case 404:
          return "No account found with this email address. Please check your email or sign up.";
        case 422:
          return "Invalid email format. Please enter a valid email address.";
        case 429:
          return "Too many login attempts. Please try again in a few minutes.";
        case 500:
          return "Server error. Please try again later.";
        case 503:
          return "Service temporarily unavailable. Please try again later.";
        default:
          return data?.message || data?.error || data?.details || "Login failed. Please try again.";
      }
    }

    // Handle regular Error
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

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("1. Attempting login...");
      
      // Validate email format before making API call
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Please enter a valid email address.");
      }

      console.log("2. Sending login request with:", {
        email: data.email.trim().toLowerCase(),
        passwordLength: data.password.length,
      });

      const res = await loginUserWeb({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      console.log("3. Login response received:", res);

      // Check if res is falsy
      if (!res) {
        throw new Error("No response received from server. Please try again.");
      }

      // Wait for cookie to be set
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("4. Fetching user data from /api/me...");
      
      const userResponse = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("5. /api/me response status:", userResponse.status);

      if (!userResponse.ok) {
        let errorMessage = "Failed to fetch user data.";
        
        try {
          const errorData = await userResponse.json();
          console.error("6. /api/me error:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        // Handle specific status codes from /api/me
        if (userResponse.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (userResponse.status === 404) {
          errorMessage = "User data not found. Please contact support.";
        }

        throw new Error(errorMessage);
      }

      const userData = await userResponse.json();
      console.log("7. User data received:", {
        id: userData.id,
        email: userData.email,
        roles: userData.roles,
      });

      // Validate user data
      if (!userData || !userData.id) {
        throw new Error("Invalid user data received. Please try again.");
      }

      const roles = userData.roles || [];
      console.log("8. User roles:", roles);

      // Redirect based on role
      if (roles.includes("ROLE_DOCTOR")) {
        console.log("9. Redirecting to doctor-dashboard");
        router.push("/doctor-dashboard");
      } else if (roles.includes("ROLE_PATIENT")) {
        console.log("9. Redirecting to patient-dashboard");
        router.push("/patient-dashboard");
      } else if (roles.includes("ROLE_ADMIN")) {
        console.log("9. Redirecting to admin-dashboard");
        router.push("/admin-dashboard");
      } else {
        console.log("9. No specific role found, redirecting to patient-dashboard");
        router.push("/patient-dashboard");
      }

      reset();
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

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
            placeholder="Enter your password"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" {...register("rememberMe")} />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
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

          <HealthcareButton
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            Sign In
          </HealthcareButton>
        </form>
      </CardContent>
    </Card>
  );
}