"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FileText,
  Play,
  ShieldAlert,
  Users,
  Target,
  TrendingUp,
  Building2,
} from "lucide-react";

import { PageBanner } from "@/components/common/page-banner";
import { StatCard } from "@/components/common/stat-card";
import { QuickActionCard } from "@/components/common/quick-action-card";
import { SectionCard } from "@/components/common/section-card";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { AvatarStack } from "@/components/common/avatar-stack";
import { useDatabase } from "@/app/protected/database-context";
import { ProjectStatus, ActivityType } from "@/lib/types";

const getStatusLabel = (status: ProjectStatus) => {
  const statusMap: Record<
    ProjectStatus,
    {
      label: string;
      tone: "emerald" | "blue" | "amber" | "rose" | "slate" | "teal";
    }
  > = {
    [ProjectStatus.DRAFT]: { label: "Brouillon", tone: "slate" },
    [ProjectStatus.PLANNING]: { label: "Planification", tone: "amber" },
    [ProjectStatus.ACTIVE]: { label: "En cours", tone: "emerald" },
    [ProjectStatus.ON_HOLD]: { label: "En pause", tone: "blue" },
    [ProjectStatus.DELAYED]: { label: "En retard", tone: "rose" },
    [ProjectStatus.COMPLETED]: { label: "Terminé", tone: "teal" },
    [ProjectStatus.CANCELLED]: { label: "Annulé", tone: "slate" },
    [ProjectStatus.ARCHIVED]: { label: "Archivé", tone: "slate" },
  };
  return statusMap[status];
};

export default function DashboardPage() {
  const router = useRouter();
  const {
    projects,
    employees,
    assignments,
    activities,
    fetchProjects,
    fetchEmployees,
    fetchAssignments,
    fetchActivities,
  } = useDatabase();

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    fetchAssignments();
    fetchActivities();
  }, [fetchProjects, fetchEmployees, fetchAssignments, fetchActivities]);

  // Calculate stats
  const activeProjects = projects.data.filter(
    (p) => p.status === ProjectStatus.ACTIVE
  );
  const planningProjects = projects.data.filter(
    (p) => p.status === ProjectStatus.PLANNING
  );
  const onHoldProjects = projects.data.filter(
    (p) => p.status === ProjectStatus.ON_HOLD
  );
  const delayedProjects = projects.data.filter(
    (p) => p.status === ProjectStatus.DELAYED
  );

  const completedThisMonth = projects.data.filter((p) => {
    if (p.status === ProjectStatus.COMPLETED && p.actualEndDate) {
      const endDate = new Date(p.actualEndDate);
      const now = new Date();
      return (
        endDate.getMonth() === now.getMonth() &&
        endDate.getFullYear() === now.getFullYear()
      );
    }
    return false;
  });

  const assignedEmployeeIds = new Set(
    assignments.data.map((a) => a.employeeId)
  );
  const occupancyRate =
    employees.data.length > 0
      ? Math.round((assignedEmployeeIds.size / employees.data.length) * 100)
      : 0;

  const totalBudget = projects.data.reduce(
    (sum, p) => sum + (Number(p.budgetTotal) || 0),
    0
  );
  const consumedBudget = projects.data.reduce(
    (sum, p) => sum + (Number(p.budgetConsumed) || 0),
    0
  );
  const budgetPercentage =
    totalBudget > 0 ? Math.round((consumedBudget / totalBudget) * 100) : 0;

  const statCards = [
    {
      title: "Projets actifs",
      value: activeProjects.length.toString(),
      subtitle: "Gestion en cours",
      icon: <Play className="h-5 w-5 text-emerald-600" />,
      accentEmoji: "🏗️",
      progress: activeProjects.length > 0 ? 75 : 0,
      progressColor: "#22c55e",
    },
    {
      title: "Planification",
      value: planningProjects.length.toString(),
      subtitle: "À lancer ce mois-ci",
      icon: <CalendarDays className="h-5 w-5 text-amber-500" />,
      accentEmoji: "📋",
      progress: planningProjects.length > 0 ? 25 : 0,
      progressColor: "#f59e0b",
    },
    {
      title: "Projets en pause",
      value: onHoldProjects.length.toString(),
      subtitle: "En attente de validation",
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      accentEmoji: "⏸️",
      progress: onHoldProjects.length > 0 ? 12 : 0,
      progressColor: "#3b82f6",
    },
    {
      title: "Terminés ce mois",
      value: completedThisMonth.length.toString(),
      subtitle: `${completedThisMonth.length} projet${
        completedThisMonth.length > 1 ? "s" : ""
      }`,
      icon: <TrendingUp className="h-5 w-5 text-violet-500" />,
      accentEmoji: "✅",
    },
    {
      title: "En retard",
      value: delayedProjects.length.toString(),
      subtitle: "Action requise",
      icon: <ShieldAlert className="h-5 w-5 text-rose-500" />,
      accentEmoji: "⚠️",
    },
  ];

  const quickActions = [
    {
      title: "Créer un projet",
      subtitle: "Nouveau chantier",
      icon: <Play className="h-5 w-5" />,
      tone: "emerald" as const,
      onClick: () => router.push("/protected/chantiers"),
    },
    {
      title: "Planifier",
      subtitle: "Calendrier projet",
      icon: <CalendarDays className="h-5 w-5" />,
      tone: "amber" as const,
      onClick: () => router.push("/protected/planning"),
    },
    {
      title: "Rapports",
      subtitle: "Analyses projets",
      icon: <BarChart3 className="h-5 w-5" />,
      tone: "purple" as const,
      onClick: () => router.push("/protected/dashboard"),
    },
    {
      title: "Ajouter un membre",
      subtitle: "Gestion RH",
      icon: <Users className="h-5 w-5" />,
      tone: "blue" as const,
      onClick: () => router.push("/protected/employes"),
    },
  ];

  // Top 3 projects for pipeline
  const projectPipeline = [...projects.data]
    .filter(
      (p) =>
        p.status !== ProjectStatus.COMPLETED &&
        p.status !== ProjectStatus.CANCELLED
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3)
    .map((project) => ({
      name: project.name,
      city: project.city || "Non spécifié",
      status: getStatusLabel(project.status),
      progress: project.progress,
      team:
        project.assignments?.slice(0, 3).map((assignment) => ({
          name: assignment.employee?.name || "Employé",
          avatarUrl:
            assignment.employee?.imageUrl ||
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
        })) || [],
    }));

  // Recent activities
  const recentActivities = activities.data.slice(0, 3).map((activity) => {
    const time = new Date(activity.createdAt).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let tone: "emerald" | "blue" | "rose" = "blue";
    if (
      activity.type === ActivityType.MILESTONE_COMPLETED ||
      activity.type === ActivityType.PROJECT_STATUS_CHANGED
    ) {
      tone = "emerald";
    } else if (activity.type === ActivityType.ALERT_CREATED) {
      tone = "rose";
    }

    return {
      time,
      title: activity.title,
      description: activity.description || "Aucune description",
      tone,
    };
  });

  const dashboardOverview = [
    {
      label: "Taux d'occupation",
      value: `${occupancyRate}%`,
      sub: "Moy. équipes",
    },
    {
      label: "Budget consommé",
      value: `${budgetPercentage}%`,
      sub: "vs planifié",
    },
    {
      label: "Total employés",
      value: employees.data.length.toString(),
      sub: `${assignedEmployeeIds.size} affectés`,
    },
  ];

  if (projects.loading || employees.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-slate-600">
            Chargement du tableau de bord...
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <PageBanner
        title="Bonjour 👋"
        subtitle="Bienvenue sur votre tableau de bord"
        stats={[
          { value: "Aujourd'hui", label: "Dernière connexion" },
          { value: "24", label: "Notifications en attente" },
        ]}
        actions={[
          {
            label: "Nouveau projet",
            icon: <Play className="h-4 w-4" />,
            href: "/protected/chantiers",
          },
          {
            label: "Ajouter un employé",
            icon: <Users className="h-4 w-4" />,
            variant: "secondary",
            href: "/protected/employes",
          },
        ]}
      />

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <SectionCard
            title="Pipeline projets"
            description="Vue consolidée des chantiers prioritaires"
            action={
              <button
                onClick={() => router.push("/protected/chantiers")}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
              >
                Voir tous les projets
              </button>
            }
          >
            {projectPipeline.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Aucun projet en cours. Créez un projet pour commencer.
              </div>
            ) : (
              <div className="space-y-6">
                {projectPipeline.map((project) => (
                  <div
                    key={project.name}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {project.name}
                      </p>
                      <p className="text-sm text-slate-500">{project.city}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-40">
                        <ProgressBar
                          value={project.progress}
                          tone="blue"
                          size="sm"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {project.progress}% terminé
                        </p>
                      </div>
                      <StatusBadge
                        label={project.status.label}
                        tone={project.status.tone}
                      />
                      <AvatarStack avatars={project.team} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Vue d'ensemble" description="Performance globale">
            <div className="space-y-4">
              {dashboardOverview.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {item.value}
                  </p>
                  <p className="text-sm text-slate-500">{item.sub}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
          <SectionCard
            title="Activité récente"
            description="Derniers événements projets"
            action={
              <button
                onClick={() => {
                  // TODO: Implement mark all as read functionality
                  alert("Toutes les activités ont été marquées comme lues");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
              >
                Tout marquer comme lu
              </button>
            }
          >
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Aucune activité récente
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="pt-1 text-sm font-semibold text-slate-500">
                      {activity.time}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {activity.description}
                      </p>
                      <StatusBadge label="Projet" tone={activity.tone} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Priorités du jour"
            description="Points de vigilance"
          >
            <div className="space-y-4">
              {delayedProjects.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                  <Target className="mt-1 h-5 w-5 text-rose-500" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {delayedProjects.length} projet
                      {delayedProjects.length > 1 ? "s" : ""} en retard
                    </p>
                    <p className="text-sm text-slate-600">
                      Organiser un point pour rattraper le retard :{" "}
                      {delayedProjects.map((p) => p.name).join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {planningProjects.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                  <Building2 className="mt-1 h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {planningProjects.length} projet
                      {planningProjects.length > 1 ? "s" : ""} à lancer
                    </p>
                    <p className="text-sm text-slate-600">
                      Valider les ressources et démarrer :{" "}
                      {planningProjects
                        .slice(0, 2)
                        .map((p) => p.name)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {activeProjects.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <FileText className="mt-1 h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Suivi des {activeProjects.length} projet
                      {activeProjects.length > 1 ? "s" : ""} actif
                      {activeProjects.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-slate-600">
                      Vérifier l'avancement et les indicateurs de performance
                    </p>
                  </div>
                </div>
              )}

              {delayedProjects.length === 0 &&
                planningProjects.length === 0 &&
                activeProjects.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Aucune priorité pour le moment
                  </div>
                )}
            </div>
          </SectionCard>
        </div>
      </section>
    </>
  );
}
