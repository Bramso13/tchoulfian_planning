import { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BannerStat = {
  label: string;
  value: string;
  dotColor?: string;
};

type BannerAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
};

type PageBannerProps = {
  title: string;
  subtitle?: string;
  stats?: BannerStat[];
  actions?: BannerAction[];
  rightContent?: ReactNode;
  className?: string;
};

export function PageBanner({
  title,
  subtitle,
  stats,
  actions,
  rightContent,
  className,
}: PageBannerProps) {
  return (
    <section
      className={cn(
        "bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 py-8",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-lg text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          {stats && stats.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  {stat.dotColor ? (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stat.dotColor }}
                    />
                  ) : null}
                  <span className="font-medium text-slate-900">
                    {stat.value}
                  </span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {actions && actions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {actions.map((action) => {
                const content = (
                  <>
                    {action.icon ? (
                      <span className="flex h-5 w-5 items-center justify-center">
                        {action.icon}
                      </span>
                    ) : null}
                    <span>{action.label}</span>
                  </>
                );

                const baseClass =
                  "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition";

                if (action.href) {
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={cn(
                        baseClass,
                        action.variant === "secondary"
                          ? "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          : "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                      )}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className={cn(
                      baseClass,
                      action.variant === "secondary"
                        ? "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        : "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                    )}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {rightContent ? (
          <div className="w-full max-w-sm md:w-auto">{rightContent}</div>
        ) : null}
      </div>
    </section>
  );
}



