"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Filter,
  Search,
  GraduationCap,
  Users,
  Calendar,
  Award,
  Plus,
} from "lucide-react";

import { PageBanner } from "@/components/common/page-banner";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { AddTrainingSessionModal } from "@/components/training/add-training-session-modal";
import { useDatabase } from "@/app/protected/database-context";
import { TrainingStatus } from "@/lib/types";

export default function FormationsPage() {
  const {
    trainingSessions,
    trainingEnrollments,
    employees,
    fetchTrainingSessions,
    fetchTrainingEnrollments,
    fetchEmployees,
  } = useDatabase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrainingSessions();
    fetchTrainingEnrollments();
    fetchEmployees();
  }, [fetchTrainingSessions, fetchTrainingEnrollments, fetchEmployees]);

  // Calculate stats
  const totalSessions = trainingSessions.data.length;
  const activeSessions = trainingSessions.data.filter((session) => {
    const now = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);
    return start <= now && now <= end;
  }).length;

  const totalEnrollments = trainingEnrollments.data.length;
  const completedEnrollments = trainingEnrollments.data.filter(
    (enrollment) => enrollment.status === TrainingStatus.COMPLETED
  ).length;

  const inProgressEnrollments = trainingEnrollments.data.filter(
    (enrollment) => enrollment.status === TrainingStatus.IN_PROGRESS
  ).length;

  const employeesInTraining = new Set(
    trainingEnrollments.data
      .filter((e) => e.status === TrainingStatus.IN_PROGRESS)
      .map((e) => e.employeeId)
  ).size;

  // Filter sessions by search query
  const filteredSessions = trainingSessions.data.filter((session) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.name.toLowerCase().includes(query) ||
      session.description?.toLowerCase().includes(query) ||
      session.provider?.toLowerCase().includes(query) ||
      session.location?.toLowerCase().includes(query)
    );
  });

  const trainingStats = [
    {
      title: "Sessions actives",
      value: activeSessions.toString(),
      subtitle: `Sur ${totalSessions} total`,
      icon: <GraduationCap className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Employés en formation",
      value: employeesInTraining.toString(),
      subtitle: "Actuellement",
      icon: <Users className="h-5 w-5 text-emerald-500" />,
    },
    {
      title: "Inscriptions",
      value: totalEnrollments.toString(),
      subtitle: `${inProgressEnrollments} en cours`,
      icon: <Calendar className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "Formations terminées",
      value: completedEnrollments.toString(),
      subtitle: "Certifications obtenues",
      icon: <Award className="h-5 w-5 text-violet-500" />,
    },
  ];

  return (
    <>
      <AddTrainingSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <PageBanner
        title="Gestion des formations"
        subtitle="Planifiez et suivez les formations de vos équipes"
        stats={[
          {
            value: `${activeSessions}`,
            label: "sessions actives",
          },
          {
            value: `${employeesInTraining}`,
            label: "employés en formation",
          },
        ]}
        actions={[
          {
            label: "Nouvelle formation",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setIsModalOpen(true),
          },
          {
            label: "Exporter",
            icon: <Download className="h-4 w-4" />,
            variant: "secondary",
          },
        ]}
      />

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {trainingStats.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <SectionCard
          title="Recherche & filtres"
          description="Affinez vos résultats"
          action={
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600">
              <Filter className="h-4 w-4" />
              Filtres avancés
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Rechercher par nom, organisme, lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-transparent bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-600 transition focus:border-blue-500/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Sessions de formation"
          description="Toutes les formations disponibles"
          action={
            <StatusBadge
              label={`${filteredSessions.length} session${filteredSessions.length > 1 ? "s" : ""}`}
              tone="blue"
            />
          }
        >
          {trainingSessions.loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Chargement des formations...
            </div>
          ) : trainingSessions.error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              Erreur : {trainingSessions.error}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                {searchQuery
                  ? "Aucune formation ne correspond à votre recherche."
                  : "Aucune formation planifiée. Créez-en une pour commencer."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredSessions.map((session) => {
                // Get enrollments for this session
                const sessionEnrollments = trainingEnrollments.data.filter(
                  (e) => e.trainingSessionId === session.id
                );

                return (
                  <TrainingSessionCard
                    key={session.id}
                    session={session}
                    enrollments={sessionEnrollments}
                    employees={employees.data}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>
      </section>
    </>
  );
}
