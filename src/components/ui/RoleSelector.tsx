import * as React from "react";
import { cn } from "@/lib/utils";
import { UserIcon, Stethoscope } from "lucide-react";

export type UserRole = "patient" | "doctor";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
}

export function RoleSelector({ value, onChange, className }: RoleSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        I am a <span className="text-healthcare-error">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("patient")}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
            "hover:shadow-md hover:scale-[1.02]",
            value === "patient"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-input bg-background hover:border-primary/50"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center mb-2",
            value === "patient" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <UserIcon className="w-4 h-4" />
          </div>
          <span className={cn(
            "text-sm font-medium",
            value === "patient" ? "text-primary" : "text-foreground"
          )}>
            Patient
          </span>
          {value === "patient" && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onChange("doctor")}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
            "hover:shadow-md hover:scale-[1.02]",
            value === "doctor"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-input bg-background hover:border-primary/50"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center mb-2",
            value === "doctor" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className={cn(
            "text-sm font-medium",
            value === "doctor" ? "text-primary" : "text-foreground"
          )}>
            Doctor
          </span>
          {value === "doctor" && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}