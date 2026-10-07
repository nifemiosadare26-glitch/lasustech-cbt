import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  trendType?: 'up' | 'down' | 'neutral';
  href?: string;
}

export function StatCard({ label, value, delta, trendType, href = "#" }: StatCardProps) {
  return (
    <Link 
      href={href} 
      className="block min-w-[220px] flex-1 bg-white border border-gray-200 rounded-[12px] p-4 hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="text-[13px] font-medium text-gray-700">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-[32px] font-semibold text-gray-900 leading-none tracking-tight">{value}</div>
        {delta && (
          <div className={cn(
            "flex items-center gap-1 text-[12px] font-medium px-1.5 py-0.5 rounded",
            trendType === 'up' ? "text-green-700 bg-green-50" : 
            trendType === 'down' ? "text-red-700 bg-red-50" : 
            "text-gray-600 bg-gray-100"
          )}>
            {trendType === 'up' && <TrendingUp size={14} />}
            {trendType === 'down' && <TrendingDown size={14} />}
            {trendType === 'neutral' && <Minus size={14} />}
            {delta}
          </div>
        )}
      </div>
    </Link>
  );
}
