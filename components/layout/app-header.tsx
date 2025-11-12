"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useDatabase } from "@/app/protected/database-context";
import {
  CalendarDays,
  GraduationCap,
  HardHat,
  LayoutDashboard,
  Loader2,
  Search,
  Users,
  Bell,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/protected/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Planning",
    href: "/protected/planning",
    icon: CalendarDays,
  },
  {
    label: "Employés",
    href: "/protected/employes",
    icon: Users,
  },
  {
    label: "Chantiers",
    href: "/protected/chantiers",
    icon: HardHat,
  },
  {
    label: "Formations",
    href: "/protected/formations",
    icon: GraduationCap,
  },
];

export function AppHeader({ activePath }: { activePath: string }) {
  type AppHeaderUser = {
    name: string;
    role: string;
    avatarUrl: string;
  };

  const [user, setUser] = useState<AppHeaderUser | null>(null);
  const { employees, projects, fetchEmployees, fetchProjects } = useDatabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isPrimingDirectory, setIsPrimingDirectory] = useState(false);
  const [hasPrimedDirectory, setHasPrimedDirectory] = useState(
    employees.data.length > 0 || projects.data.length > 0
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const mapUser = (userData: import("@supabase/supabase-js").User | null) => {
      if (!userData) {
        setUser(null);
        return;
      }

      const metadata = (userData.user_metadata ?? {}) as Record<string, any>;

      setUser({
        name:
          metadata.full_name ??
          metadata.name ??
          userData.email ??
          "Utilisateur",
        role: metadata.role ?? "Collaborateur",
        avatarUrl:
          metadata.avatar_url ??
          metadata.avatarUrl ??
          (metadata.full_name ?? metadata.name
            ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                metadata.full_name ?? metadata.name
              )}`
            : ""),
      });
    };

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Impossible de récupérer l'utilisateur connecté:", error);
        setUser(null);
        return;
      }

      mapUser(data.user);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      mapUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const displayName = user?.name ?? "Utilisateur";
  const displayRole = user?.role ?? "Connecté";
  const avatarSrc = useMemo(() => {
    if (user?.avatarUrl) {
      return user.avatarUrl;
    }

    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      displayName
    )}`;
  }, [user?.avatarUrl, displayName]);

  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (employees.data.length > 0 || projects.data.length > 0) {
      setHasPrimedDirectory(true);
    }
  }, [employees.data.length, projects.data.length]);

  const ensureDirectoryLoaded = useCallback(async () => {
    if (hasPrimedDirectory || isPrimingDirectory) {
      return;
    }

    setIsPrimingDirectory(true);
    try {
      await Promise.all([fetchEmployees(), fetchProjects()]);
      setHasPrimedDirectory(true);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de recherche:",
        error
      );
    } finally {
      setIsPrimingDirectory(false);
    }
  }, [fetchEmployees, fetchProjects, hasPrimedDirectory, isPrimingDirectory]);

  const handleSearchFocus = useCallback(() => {
    setIsSearchActive(true);
    void ensureDirectoryLoaded();
  }, [ensureDirectoryLoaded]);

  useEffect(() => {
    if (!isSearchActive) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchActive(false);
        setSearchQuery("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchActive(false);
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchActive]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasQuery = normalizedQuery.length >= 2;

  const projectResults = useMemo(() => {
    if (!hasQuery) {
      return [];
    }

    return projects.data
      .filter((project) => {
        const haystack = [
          project.name,
          project.city,
          project.postalCode,
          project.description,
          project.client?.name,
          project.projectManager?.name,
          project.projectManager?.profile?.full_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [hasQuery, normalizedQuery, projects.data]);

  const employeeResults = useMemo(() => {
    if (!hasQuery) {
      return [];
    }

    return employees.data
      .filter((employee) => {
        const skillNames = employee.skills
          ?.map((skill) => skill.skill?.name)
          .filter(Boolean);

        const haystack = [
          employee.name,
          employee.profile?.full_name,
          employee.jobTitle,
          employee.email,
          employee.phone,
          employee.department?.name,
          ...(skillNames ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [employees.data, hasQuery, normalizedQuery]);

  const firstResultHref = projectResults[0]?.id
    ? `/protected/chantiers/${projectResults[0].id}`
    : employeeResults[0]?.id
    ? `/protected/employes/${employeeResults[0].id}`
    : null;

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && firstResultHref) {
      event.preventDefault();
      setIsSearchActive(false);
      setSearchQuery("");
      searchInputRef.current?.blur();
      router.push(firstResultHref);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsSearchActive(false);
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  const handleResultSelect = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery("");
    searchInputRef.current?.blur();
  }, []);

  const isLoadingResults =
    isPrimingDirectory || employees.loading || projects.loading;
  const hasResults = projectResults.length > 0 || employeeResults.length > 0;

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erreur lors de la déconnexion:", error);
      return;
    }

    router.refresh();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/protected/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-none">
                TCHOULFIAN
              </p>
              <p className="text-sm text-slate-500">
                Gestion d&apos;équipes &amp; projets
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-50 p-1 text-sm font-medium text-slate-600">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 transition-colors",
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "hover:bg-white hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={searchContainerRef}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              ref={searchInputRef}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={handleInputKeyDown}
              className="w-64 rounded-xl border border-transparent bg-slate-50 px-10 py-2 text-sm font-medium text-slate-600 transition focus:border-blue-500/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoComplete="off"
              aria-expanded={isSearchActive}
              aria-haspopup="listbox"
              role="combobox"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            {isSearchActive ? (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex flex-col">
                  {!hasQuery ? (
                    <div className="px-4 py-6 text-sm text-slate-500">
                      Tapez au moins deux caractères pour lancer une recherche.
                    </div>
                  ) : isLoadingResults && !hasResults ? (
                    <div className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      Recherche en cours...
                    </div>
                  ) : hasResults ? (
                    <>
                      {projectResults.length > 0 && (
                        <div>
                          <div className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Chantiers
                          </div>
                          <ul className="py-2" role="listbox">
                            {projectResults.map((project) => (
                              <li key={project.id}>
                                <Link
                                  href={`/protected/chantiers/${project.id}`}
                                  onClick={handleResultSelect}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                  role="option"
                                >
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <HardHat className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {project.name}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                      {project.city ?? "Lieu à préciser"}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {employeeResults.length > 0 && (
                        <div>
                          <div className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Employés
                          </div>
                          <ul className="py-2" role="listbox">
                            {employeeResults.map((employee) => (
                              <li key={employee.id}>
                                <Link
                                  href={`/protected/employes/${employee.id}`}
                                  onClick={handleResultSelect}
                                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                  role="option"
                                >
                                  {employee.imageUrl ? (
                                    <img
                                      src={employee.imageUrl}
                                      alt={employee.name ?? "Employé"}
                                      className="h-9 w-9 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                      <Users className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {employee.name ??
                                        employee.profile?.full_name ??
                                        "Employé sans nom"}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                      {employee.jobTitle ??
                                        employee.department?.name ??
                                        "Poste à préciser"}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-500">
                      Aucun résultat trouvé pour « {searchQuery} ».
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white">
              3
            </span>
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleToggleMenu}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition hover:border-slate-200 hover:bg-white"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500">{displayRole}</p>
              </div>
              <img
                src={avatarSrc}
                alt={displayName}
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-14 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
                >
                  Déconnexion
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
