import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  tone?: "emerald" | "amber" | "purple" | "blue";
  onClick?: () => void;
};

const toneClasses: Record<
  NonNullable<QuickActionCardProps["tone"]>,
  { bg: string; border: string; iconBg: string }
> = {
  emerald: {
    bg: "from-emerald-50 to-emerald-100",
    border: "border-emerald-200",
    iconBg: "bg-emerald-500",
  },
  amber: {
    bg: "from-amber-50 to-amber-100",
    border: "border-amber-200",
    iconBg: "bg-amber-500",
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    iconBg: "bg-purple-500",
  },
  blue: {
    bg: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    iconBg: "bg-blue-500",
  },
};

export function QuickActionCard({
  title,
  subtitle,
  icon,
  tone = "emerald",
  onClick,
}: QuickActionCardProps) {
  const colors = toneClasses[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl border bg-gradient-to-br p-6 text-left transition hover:shadow-md",
        colors.border,
        colors.bg
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl text-white transition group-hover:scale-105",
            colors.iconBg
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">{title}</p>
          {subtitle ? (
            <p className="text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}


