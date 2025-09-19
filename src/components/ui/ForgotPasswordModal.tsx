import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormInput } from "./form-input";
import { HealthcareButton } from "./healthcare-button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setStatus("idle");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold text-primary">
            Reset Your Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your email address and we willsend you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 bg-healthcare-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-healthcare-success" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We ve sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <HealthcareButton onClick={handleClose} className="w-full">
              Close
            </HealthcareButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <HealthcareButton
                type="submit"
                loading={isLoading}
                className="flex-1"
              >
                Send Reset Link
              </HealthcareButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}