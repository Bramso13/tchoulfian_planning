import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  tone?: "emerald" | "amber" | "blue" | "rose" | "slate" | "teal" | "violet";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const toneMap: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  slate: "bg-slate-500",
  teal: "bg-teal-500",
  violet: "bg-violet-500",
};

const sizeMap: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  tone = "blue",
  size = "md",
  className,
}: ProgressBarProps) {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full rounded-full bg-slate-100", sizeMap[size], className)}>
      <div
        className={cn("h-full rounded-full", toneMap[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}





