import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  action?: { label: string; href: string };
  noPadding?: boolean;
}

export function Card({ className, title, action, noPadding = false, children, ...props }: CardProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-[12px] overflow-hidden", className)} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
          {title && <h3 className="font-semibold text-[17px] text-gray-900 tracking-tight">{title}</h3>}
          {action && (
            <Link href={action.href} className="text-[13px] font-medium text-blue-700 hover:underline">
              {action.label}
            </Link>
          )}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-4")}>{children}</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  href?: string;
}

export function StatCard({ label, value, delta, href = "#" }: StatCardProps) {
  return (
    <Link 
      href={href} 
      className="block min-w-[220px] flex-1 bg-white border border-gray-200 rounded-[12px] p-4 hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="text-[13px] font-medium text-gray-700">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">{value}</div>
        {delta && (
          <div className="text-[12px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
            {delta}
          </div>
        )}
      </div>
    </Link>
  );
}
