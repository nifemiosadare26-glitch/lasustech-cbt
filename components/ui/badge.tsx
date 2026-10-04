import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 
    | "default" 
    | "success" 
    | "warning" 
    | "danger" 
    | "blue-solid" 
    | "blue-tint" 
    | "gray-solid" 
    | "gray-tint";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-success-tint text-success-ink",
    warning: "bg-warning-tint text-warning-ink",
    danger: "bg-danger-tint text-danger-ink",
    "blue-solid": "bg-blue-600 text-white",
    "blue-tint": "bg-blue-100 text-blue-900",
    "gray-solid": "bg-gray-700 text-white",
    "gray-tint": "bg-gray-100 text-gray-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
