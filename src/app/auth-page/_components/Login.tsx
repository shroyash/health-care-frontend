"use client";

import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form-input";
import { HealthcareButton } from "@/components/ui/healthcare-button";
import { loginUserWeb } from "@/app/api/auth";
import { useState } from "react";

interface LoginProps {
  setShowForgotPassword: (val: boolean) => void;
}

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export default function Login({ setShowForgotPassword }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await loginUserWeb({ email: data.email, password: data.password });
      console.log("Login response:", res);
      reset();
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
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

          <HealthcareButton type="submit" loading={isLoading} className="w-full" size="lg">
            Sign In
          </HealthcareButton>
        </form>
      </CardContent>
    </Card>
  );
}
