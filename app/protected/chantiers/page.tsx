"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Filter,
  LayoutList,
  Grid3x3,
  CalendarDays,
  MapPin,
  Users,
  Building2,
  Play,
  PauseCircle,
  AlertTriangle,
} from "lucide-react";

import { PageBanner } from "@/components/common/page-banner";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { AvatarStack } from "@/components/common/avatar-stack";
import { AddProjectModal } from "@/components/projects/add-project-modal";
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

const formatDate = (date: Date | null) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
};

type ViewMode = "list" | "grid" | "calendar";
type StatusFilter = ProjectStatus | "ALL";

export default function ChantiersPage() {
  const router = useRouter();
  const { projects, fetchProjects, updateProject, deleteProject } =
    useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const activeCount = projects.data.filter(
    (p) => p.status === ProjectStatus.ACTIVE
  ).length;
  const planningCount = projects.data.filter(
    (p) => p.status === ProjectStatus.PLANNING
  ).length;
  const onHoldCount = projects.data.filter(
    (p) => p.status === ProjectStatus.ON_HOLD
  ).length;
  const delayedCount = projects.data.filter(
    (p) => p.status === ProjectStatus.DELAYED
  ).length;

  const projectStats = [
    {
      title: "Projets actifs",
      value: activeCount.toString(),
      subtitle: "En cours d'exécution",
      icon: <Play className="h-5 w-5 text-emerald-500" />,
      progress: activeCount > 0 ? 75 : 0,
      progressColor: "#22c55e",
    },
    {
      title: "Planification",
      value: planningCount.toString(),
      subtitle: "Prochain démarrage",
      icon: <CalendarDays className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "En pause",
      value: onHoldCount.toString(),
      subtitle: "En attente de décision",
      icon: <PauseCircle className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "En retard",
      value: delayedCount.toString(),
      subtitle: "Action requise",
      icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
    },
  ];
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
  }).length;

  // Filtrer les projets selon le filtre de statut
  const filteredProjects =
    statusFilter === "ALL"
      ? projects.data
      : projects.data.filter((p) => p.status === statusFilter);

  // Fonction pour exporter les données en JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(projects.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `projets_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fonction pour exporter en CSV
  const handleExportCSV = () => {
    const headers = [
      "Nom",
      "Type",
      "Statut",
      "Ville",
      "Date début",
      "Date fin",
      "Progrès",
      "Effectif",
    ];
    const rows = projects.data.map((p) => [
      p.name,
      getProjectTypeLabel(p.type),
      getStatusLabel(p.status).label,
      p.city || "Non spécifié",
      formatDate(p.startDate) || "Non définie",
      formatDate(p.endDate) || "Non définie",
      `${p.progress}%`,
      (p.assignments?.length || 0).toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `projets_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fonction pour archiver un projet
  const handleArchiveProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir archiver le projet "${projectName}" ?\n\nCette action changera son statut en "Archivé".`
      )
    ) {
      try {
        await updateProject(projectId, { status: ProjectStatus.ARCHIVED });
      } catch (error) {
        alert("Erreur lors de l'archivage du projet.");
        console.error(error);
      }
    }
  };

  // Fonction pour naviguer vers les détails
  const handleNavigateToDetails = (projectId: string) => {
    router.push(`/protected/chantiers/${projectId}`);
  };

  return (
    <>
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <PageBanner
        title="Gestion des projets"
        subtitle="Pilotez l'ensemble des chantiers et suivez leur avancement"
        stats={[
          { value: activeCount.toString(), label: "Projets actifs" },
          { value: planningCount.toString(), label: "En planification" },
          { value: completedThisMonth.toString(), label: "Terminés ce mois" },
        ]}
        actions={[
          {
            label: "Nouveau projet",
            icon: <Building2 className="h-4 w-4" />,
            onClick: () => setIsModalOpen(true),
          },
          {
            label: "Exporter",
            icon: <Download className="h-4 w-4" />,
            variant: "secondary",
            onClick: handleExportData,
          },
        ]}
      />

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {projectStats.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <SectionCard
          title="Filtres"
          description="Affinez votre recherche"
          action={
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600">
              <Filter className="h-4 w-4" />
              Plus de filtres
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: "Tous les statuts", value: "ALL" as const },
              { label: "En cours", value: ProjectStatus.ACTIVE },
              { label: "Planification", value: ProjectStatus.PLANNING },
              { label: "En pause", value: ProjectStatus.ON_HOLD },
              { label: "Terminés", value: ProjectStatus.COMPLETED },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setStatusFilter(item.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  statusFilter === item.value
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-white font-semibold text-blue-600 shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <LayoutList className="h-4 w-4" />
              Liste
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === "grid"
                  ? "bg-white font-semibold text-blue-600 shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              Grille
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === "calendar"
                  ? "bg-white font-semibold text-blue-600 shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendrier
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Liste des projets"
          description={`${filteredProjects.length} projet${
            filteredProjects.length > 1 ? "s" : ""
          } affiché${filteredProjects.length > 1 ? "s" : ""}`}
          action={
            <button
              onClick={handleExportCSV}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
            >
              Export CSV
            </button>
          }
        >
          {projects.loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Chargement des projets...
            </div>
          ) : projects.error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              Erreur : {projects.error}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                Aucun projet trouvé. Créez-en un pour commencer.
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid" ? "grid gap-6 md:grid-cols-2" : "grid gap-6"
              }
            >
              {filteredProjects.map((project) => {
                const statusInfo = getStatusLabel(project.status);
                const typeLabel = getProjectTypeLabel(project.type);
                const location = project.city
                  ? `${project.city}${
                      project.postalCode ? ` (${project.postalCode})` : ""
                    }`
                  : project.address || "Non spécifié";
                const startDateStr = formatDate(project.startDate);
                const endDateStr = formatDate(project.endDate);
                const duration =
                  startDateStr && endDateStr
                    ? `${startDateStr} - ${endDateStr}`
                    : startDateStr || endDateStr || "Non définie";
                const teamCount = project.assignments?.length || 0;
                const teamAvatars =
                  project.assignments?.slice(0, 3).map((assignment) => ({
                    name: assignment.employee?.name || "Employé",
                    avatarUrl:
                      assignment.employee?.imageUrl ||
                      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
                  })) || [];

                let stageText = `${project.progress}% terminé`;
                if (project.status === ProjectStatus.DELAYED) {
                  stageText = "En retard";
                } else if (project.status === ProjectStatus.PLANNING) {
                  stageText = "Démarrage à venir";
                }

                return (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {project.name}
                        </p>
                        <p className="text-sm text-slate-500">{typeLabel}</p>
                      </div>
                      <StatusBadge
                        label={statusInfo.label}
                        tone={statusInfo.tone}
                      />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {location}
                      </div>
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Durée</p>
                        <p>{duration}</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Effectif</p>
                        <p>
                          {teamCount > 0 ? (
                            <span className="font-semibold text-slate-900">
                              {teamCount}
                            </span>
                          ) : (
                            <span className="font-semibold text-rose-500">
                              Non assigné
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <ProgressBar value={project.progress} tone="blue" />
                        <p className="mt-1 text-xs text-slate-500">
                          {stageText}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <AvatarStack avatars={teamAvatars} />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleNavigateToDetails(project.id)}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() =>
                            handleArchiveProject(project.id, project.name)
                          }
                          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          Archiver
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </section>
    </>
  );
}
