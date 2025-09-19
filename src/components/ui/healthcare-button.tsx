import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const healthcareButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-healthcare-gradient bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl hover:shadow-primary/25 focus-visible:ring-primary",
        secondary: "bg-white border-2 border-primary text-primary hover:bg-primary/5 shadow-md hover:shadow-lg focus-visible:ring-primary",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary-dark",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        success: "bg-healthcare-success text-white hover:bg-healthcare-success/90 shadow-lg hover:shadow-healthcare-success/25",
        destructive: "bg-healthcare-error text-white hover:bg-healthcare-error/90 shadow-lg hover:shadow-healthcare-error/25",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface HealthcareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof healthcareButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const HealthcareButton = React.forwardRef<HTMLButtonElement, HealthcareButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(healthcareButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </Comp>
    );
  }
);

HealthcareButton.displayName = "HealthcareButton";

export { HealthcareButton, healthcareButtonVariants };