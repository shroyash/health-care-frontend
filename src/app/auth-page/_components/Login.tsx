"use client";

import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form-input";
import { HealthcareButton } from "@/components/ui/healthcare-button";
import { loginUserWeb } from "@/lib/api/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { UserResponseDto } from "@/lib/type/auth";

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
}

export interface LoginResponse {
  message: string;
  status: string;
  data: UserResponseDto; // Single user object
}

export default function Login({ setShowForgotPassword }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormValues>();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data as ApiErrorResponse | undefined;

      switch (status) {
        case 400: return data?.message || "Invalid email or password format.";
        case 401:
        case 403: return data?.message || data?.error || "Invalid credentials.";
        case 404: return "Account not found.";
        case 500: return "Server error. Please try again later.";
        default: return data?.message || "Login failed. Please try again.";
      }
    }
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred.";
  };

  const onSubmit = async (formData: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address.");
      }

      const res: LoginResponse = await loginUserWeb({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const userData = res.data; 
      console.log("Logged in user:", userData);

      const roles = userData.role?.map(r => r.name);
      console.log("User roles:", roles);

      localStorage.setItem("user", JSON.stringify(userData));

  
      if (roles.includes("ROLE_DOCTOR")) router.push("/dashboard/doctor");
      else if (roles.includes("ROLE_PATIENT")) router.push("/dashboard/patient");
      else if (roles.includes("ROLE_ADMIN")) router.push("/dashboard/admin");
      else router.push("/auth-page");

      reset();
    } catch (err) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
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
                message: "Please enter a valid email address",
              },
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
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            showPasswordToggle
          />

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
