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
import { registerUser, registerDoctor } from "@/app/api/auth";
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

  // helper to convert file -> base64 string
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    if (role === "doctor" && !verificationFile) {
      setError("confirmPassword", {
        type: "manual",
        message: "Please upload your medical license",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (role === "doctor") {
        const base64String = verificationFile
          ? await fileToBase64(verificationFile)
          : "";
        const payload = {
          username: data.fullName,
          email: data.email,
          password: data.password,
          license: base64String,
        };
        await registerDoctor(payload);

        toast.info(
          "Your request has been sent to the admin. Please wait for approval. You will get an email once approved.",
          { position: "top-center", autoClose: 5000 }
        );
      } else {
        await registerUser({
          username: data.fullName,
          email: data.email,
          password: data.password,
        });

        toast.success("Patient account created successfully!", {
          position: "top-center",
          autoClose: 3000,
        });
      }
      reset();
      setVerificationFile(null);
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("Registration failed. Please try again.", {
        position: "top-center",
      });
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
            {...register("fullName", { required: "Full name is required" })}
            icon={<User className="w-5 h-5" />}
            error={errors.fullName?.message}
          />

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
              description="Upload your medical license or professional certification"
              onChange={setVerificationFile}
              error={errors.confirmPassword?.message}
            />
          )}

          <HealthcareButton
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            Create Account
          </HealthcareButton>
        </form>
      </CardContent>
    </Card>
  );
}
