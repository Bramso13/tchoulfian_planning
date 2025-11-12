import Link from "next/link";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d&apos;Ariane"
      className={cn("text-sm text-slate-500", className)}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-medium text-slate-500 transition hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-medium",
                    isLast ? "text-slate-900" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


