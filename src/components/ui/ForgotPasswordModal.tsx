"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "./form-input";
import { HealthcareButton } from "./healthcare-button";
import { Mail, CheckCircle, AlertCircle, Key } from "lucide-react";
import { forgotPassword, verifyResetToken, resetPassword } from "@/lib/api/auth";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // will be sent as `token`
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setStatus("idle");
    setError("");
    onOpenChange(false);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("idle");

    try {
      await forgotPassword({ email });
      setStep(2); // move to OTP + new password input
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Failed to send reset OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError("Please enter OTP and new password");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("idle");

    try {
      // Send token instead of otp to match backend DTO
      await verifyResetToken({ email, token: otp });
      await resetPassword({ email, token: otp, newPassword });
      setStatus("success"); // show success screen
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Invalid OTP or something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold text-primary">
            {step === 1 ? "Reset Your Password" : "Enter OTP & New Password"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1
              ? "Enter your email address and we will send you an OTP to reset your password."
              : "Enter the OTP you received and set a new password."}
          </DialogDescription>
        </DialogHeader>

        {status === "success" && step === 2 ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 bg-healthcare-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-healthcare-success" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Password Reset Successful</h3>
              <p className="text-sm text-muted-foreground">
                You can now log in with your new password.
              </p>
            </div>
            <HealthcareButton onClick={handleClose} className="w-full">
              Close
            </HealthcareButton>
          </div>
        ) : (
          <form
            onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
            className="space-y-6"
          >
            {step === 1 && (
              <FormInput
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                error={error}
                required
              />
            )}

            {step === 2 && (
              <>
                <FormInput
                  label="OTP"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  icon={<Key className="w-5 h-5" />}
                  error={error}
                  required
                />
                <FormInput
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 p-3 bg-healthcare-error/10 rounded-lg border border-healthcare-error/20">
                <AlertCircle className="w-5 h-5 text-healthcare-error flex-shrink-0" />
                <p className="text-sm text-healthcare-error">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <HealthcareButton
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </HealthcareButton>
              <HealthcareButton type="submit" loading={isLoading} className="flex-1">
                {step === 1 ? "Send OTP" : "Reset Password"}
              </HealthcareButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
