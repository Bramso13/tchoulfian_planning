"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { DatabaseProvider } from "@/app/protected/database-context";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/protected/dashboard";

  return (
    <DatabaseProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader activePath={pathname} />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </div>
    </DatabaseProvider>
  );
}
