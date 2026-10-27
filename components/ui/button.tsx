import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "danger-outline" | "outline" | "default";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-900",
      default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-900",
      secondary: "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-gray-900 dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5 hover:border-gray-400 dark:hover:border-slate-500",
      outline: "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-gray-900 dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5 hover:border-gray-400 dark:hover:border-slate-500",
      tertiary: "bg-transparent text-gray-900 dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5",
      danger: "bg-danger text-white hover:bg-danger-ink",
      "danger-outline": "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-danger hover:border-danger hover:text-danger-ink hover:bg-rose-500/5",
    };

    const sizes = {
      sm: "h-8 px-4 text-[13px]",
      md: "h-10 px-4 text-[15px]",
      lg: "h-12 px-4 text-[15px]",
      icon: "h-10 w-10 p-0",
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
