import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  accentEmoji?: string;
  progress?: number;
  progressColor?: string;
  trend?: {
    label: string;
    type?: "positive" | "negative" | "neutral";
  };
  className?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentEmoji,
  progress,
  progressColor = "#2563eb",
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>
        ) : (
          <div />
        )}
        {accentEmoji ? <span className="text-2xl">{accentEmoji}</span> : null}
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          {trend ? (
            <span
              className={cn(
                "text-sm font-medium",
                trend.type === "positive" && "text-emerald-600",
                trend.type === "negative" && "text-rose-600",
                trend.type === "neutral" && "text-slate-500"
              )}
            >
              {trend.label}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      {typeof progress === "number" ? (
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.min(Math.max(progress, 0), 100)}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}




