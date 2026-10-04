import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "danger-outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-500 disabled:border-transparent";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-900",
      secondary: "border border-gray-300 bg-white text-gray-900 hover:border-blue-700 hover:text-blue-700",
      tertiary: "bg-transparent text-gray-900 hover:bg-gray-100",
      danger: "bg-danger text-white hover:bg-danger-ink",
      "danger-outline": "border border-gray-300 bg-white text-danger hover:border-danger hover:text-danger-ink",
    };

    const sizes = {
      sm: "h-8 px-4 text-[13px]", // 32px height
      md: "h-10 px-4 text-[15px]", // 40px height
      lg: "h-12 px-4 text-[15px]", // 48px height
      icon: "h-10 w-10 p-0", // 40px square
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
