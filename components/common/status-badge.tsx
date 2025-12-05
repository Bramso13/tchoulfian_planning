import { cn } from "@/lib/utils";

type StatusTone =
  | "emerald"
  | "amber"
  | "blue"
  | "rose"
  | "slate"
  | "violet"
  | "teal";

const toneStyles: Record<
  StatusTone,
  { bg: string; text: string; dot: string }
> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500" },
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
};

export function StatusBadge({
  label,
  tone = "slate",
  dot = true,
  className,
}: StatusBadgeProps) {
  const styles = toneStyles[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        styles.bg,
        styles.text,
        className
      )}
    >
      {dot ? <span className={cn("h-2 w-2 rounded-full", styles.dot)} /> : null}
      {label}
    </span>
  );
}





