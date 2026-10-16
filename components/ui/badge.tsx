import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 
    | "default" 
    | "success" 
    | "success-solid"
    | "warning" 
    | "danger" 
    | "blue-solid" 
    | "blue-tint" 
    | "blue-outline"
    | "gray-solid" 
    | "gray-tint"
    | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    "success-solid": "bg-emerald-600 text-white",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-rose-50 text-rose-800 border border-rose-200",
    "blue-solid": "bg-blue-600 text-white",
    "blue-tint": "bg-blue-50 text-blue-900 border border-blue-200",
    "blue-outline": "bg-transparent text-blue-700 border border-blue-300",
    "gray-solid": "bg-gray-700 text-white",
    "gray-tint": "bg-gray-100 text-gray-700",
    outline: "bg-transparent text-gray-700 border border-gray-300",
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
