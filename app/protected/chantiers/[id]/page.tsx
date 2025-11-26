"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  ShieldCheck,
  Clock,
  Wrench,
  Package,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

import { PageBanner } from "@/components/common/page-banner";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { ProgressBar } from "@/components/common/progress-bar";
import { useDatabase } from "@/app/protected/database-context";
import { ProjectStatus } from "@/lib/types";

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

const getProjectTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    RESIDENTIAL: "Construction résidentielle",
    COMMERCIAL: "Construction commerciale",
    INDUSTRIAL: "Construction industrielle",
    INFRASTRUCTURE: "Infrastructure publique",
    RENOVATION: "Rénovation",
    MEDICAL: "Construction médicale",
    OTHER: "Autre",
  };
  return typeMap[type] || type;
};

const formatDate = (
  date: Date | null | string,
  format: "short" | "long" = "short"
) => {
  if (!date) return null;
  const dateObj = new Date(date);
  if (format === "long") {
    return dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return dateObj.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ChantierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const {
    projects,
    fetchProjects,
    milestones,
    fetchMilestones,
    documents,
    fetchDocuments,
    activities,
    fetchActivities,
    alerts,
    fetchAlerts,
  } = useDatabase();

  useEffect(() => {
    fetchProjects();
    fetchMilestones();
    fetchDocuments();
    fetchActivities();
    fetchAlerts();
  }, [
    fetchProjects,
    fetchMilestones,
    fetchDocuments,
    fetchActivities,
    fetchAlerts,
  ]);

  const project = useMemo(
    () => projects.data.find((p) => p.id === projectId),
    [projects.data, projectId]
  );

  const projectMilestones = useMemo(
    () => milestones.data.filter((m) => m.projectId === projectId),
    [milestones.data, projectId]
  );

  const projectDocuments = useMemo(
    () => documents.data.filter((d) => d.projectId === projectId),
    [documents.data, projectId]
  );

  const projectActivities = useMemo(
    () =>
      activities.data
        .filter((a) => a.projectId === projectId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [activities.data, projectId]
  );

  const projectAlerts = useMemo(
    () => alerts.data.filter((a) => a.projectId === projectId && !a.isResolved),
    [alerts.data, projectId]
  );

  if (projects.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Projet introuvable</p>
          <button
            onClick={() => router.push("/protected/chantiers")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Retour aux chantiers
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusLabel(project.status);
  const typeLabel = getProjectTypeLabel(project.type);
  const location = project.city
    ? `${project.city}${project.postalCode ? ` (${project.postalCode})` : ""}`
    : project.address || "Non spécifié";
  const teamCount = project.assignments?.length || 0;
  const budget = project.budgetTotal
    ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(Number(project.budgetTotal))
    : "Non défini";

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/protected/dashboard" },
              { label: "Chantiers", href: "/protected/chantiers" },
              { label: project.name },
            ]}
          />
        </div>
      </div>

      <PageBanner
        title={project.name}
        subtitle={project.description || typeLabel}
        stats={[
          { label: "Avancement global", value: `${project.progress}%` },
          {
            label: "Effectif sur site",
            value: `${teamCount} personne${teamCount > 1 ? "s" : ""}`,
          },
          {
            label: "Livraison prévue",
            value: formatDate(project.endDate, "short") || "Non définie",
          },
        ]}
        actions={[
          {
            label: "Mettre à jour",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            label: "Exporter fiche",
            icon: <CheckCircle2 className="h-4 w-4" />,
            variant: "secondary",
          },
        ]}
        rightContent={
          <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Avancement global
              </span>
              <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">
              {project.progress}%
            </div>
            <ProgressBar
              value={project.progress}
              tone="emerald"
              className="mt-3"
            />
          </div>
        }
      />

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
          <SectionCard title="Informations clés">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Localisation
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-1 h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Client</p>
                  <p className="text-base font-semibold text-slate-900">
                    {project.client?.name || "Non spécifié"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Période</p>
                  <p className="text-base font-semibold text-slate-900">
                    {formatDate(project.startDate, "long") || "Non définie"} →{" "}
                    {formatDate(project.endDate, "long") || "Non définie"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Budget</p>
                  <p className="text-base font-semibold text-slate-900">
                    {budget}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Points de vigilance">
            {projectAlerts.length > 0 ? (
              <div className="space-y-4">
                {projectAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 ${
                      alert.severity === "HIGH" || alert.severity === "CRITICAL"
                        ? "border-rose-200 bg-rose-50/70"
                        : alert.severity === "MEDIUM"
                        ? "border-amber-200 bg-amber-50/70"
                        : "border-blue-200 bg-blue-50/70"
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        alert.severity === "HIGH" ||
                        alert.severity === "CRITICAL"
                          ? "text-rose-600"
                          : alert.severity === "MEDIUM"
                          ? "text-amber-600"
                          : "text-blue-600"
                      }`}
                    >
                      {alert.title}
                    </p>
                    <p
                      className={`text-sm ${
                        alert.severity === "HIGH" ||
                        alert.severity === "CRITICAL"
                          ? "text-rose-500"
                          : alert.severity === "MEDIUM"
                          ? "text-amber-600"
                          : "text-blue-500"
                      }`}
                    >
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Aucun point de vigilance actif
              </p>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
          <SectionCard
            title="Étapes projet"
            description="Chronologie des jalons"
          >
            {projectMilestones.length > 0 ? (
              <div className="space-y-5">
                {projectMilestones.map((milestone) => {
                  const milestoneStatus =
                    milestone.status === "COMPLETED"
                      ? { label: "Terminé", tone: "emerald" as const }
                      : milestone.status === "IN_PROGRESS"
                      ? { label: "En cours", tone: "blue" as const }
                      : { label: "À venir", tone: "amber" as const };

                  return (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {milestone.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(milestone.dueDate, "long") ||
                            "Date non définie"}
                        </p>
                      </div>
                      <StatusBadge
                        label={milestoneStatus.label}
                        tone={milestoneStatus.tone}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Aucun jalon défini
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="Documentation"
            description="Dernières mises à jour"
            action={
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600">
                Ajouter un document
              </button>
            }
          >
            {projectDocuments.length > 0 ? (
              <div className="space-y-3">
                {projectDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <p className="font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {doc.category || "Document"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Mis à jour {formatDate(doc.updatedAt, "long")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Aucun document disponible
              </p>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
          <SectionCard
            title="Équipe affectée"
            description="Personnel sur le chantier"
          >
            {teamCount > 0 ? (
              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        Effectif total
                      </p>
                      <p className="text-sm text-slate-500">
                        {teamCount} personne{teamCount > 1 ? "s" : ""} assignée
                        {teamCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Aucune personne affectée
              </p>
            )}
          </SectionCard>

          <SectionCard title="Activité récente">
            {projectActivities.length > 0 ? (
              <div className="space-y-4">
                {projectActivities.map((activity) => {
                  const activityDate = new Date(activity.createdAt);
                  const timeStr = activityDate.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <Clock className="mt-1 h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {timeStr}
                        </p>
                        <p className="font-semibold text-slate-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Aucune activité récente
              </p>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Informations complémentaires">
          <div className="space-y-4">
            {project.status === ProjectStatus.ACTIVE && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <ShieldCheck className="mt-1 h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-semibold text-slate-900">Projet actif</p>
                  <p className="text-sm text-slate-600">
                    Le projet est en cours d&apos;exécution avec{" "}
                    {project.progress}% d&apos;avancement.
                  </p>
                </div>
              </div>
            )}
            {project.status === ProjectStatus.COMPLETED && (
              <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
                <CheckCircle2 className="mt-1 h-5 w-5 text-teal-500" />
                <div>
                  <p className="font-semibold text-slate-900">Projet terminé</p>
                  <p className="text-sm text-slate-600">
                    Le projet a été complété
                    {project.actualEndDate
                      ? ` le ${formatDate(project.actualEndDate, "long")}`
                      : ""}
                    .
                  </p>
                </div>
              </div>
            )}
            {project.status === ProjectStatus.DELAYED && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                <AlertTriangle className="mt-1 h-5 w-5 text-rose-500" />
                <div>
                  <p className="font-semibold text-slate-900">
                    Projet en retard
                  </p>
                  <p className="text-sm text-slate-600">
                    Ce projet nécessite une attention particulière en raison de
                    retards.
                  </p>
                </div>
              </div>
            )}
            {project.status !== ProjectStatus.ACTIVE &&
              project.status !== ProjectStatus.COMPLETED &&
              project.status !== ProjectStatus.DELAYED && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Statut du projet : {statusInfo.label}
                </p>
              )}
          </div>
        </SectionCard>
      </section>
    </>
  );
}


