import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, label, error, icon, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password") 
      : type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-healthcare-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              "flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-primary/50",
              icon && "pl-11",
              showPasswordToggle && "pr-11",
              error && "border-healthcare-error focus-visible:border-healthcare-error focus-visible:ring-healthcare-error/10",
              isFocused && "shadow-lg",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-healthcare-error animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };