import { Calendar, MapPin, Users, Building2, Clock } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import type { TrainingSession, TrainingEnrollment, Employee } from "@/lib/types";
import { TrainingStatus } from "@/lib/types";

type TrainingSessionCardProps = {
  session: TrainingSession;
  enrollments: TrainingEnrollment[];
  employees: Employee[];
};

const getSessionStatus = (session: TrainingSession) => {
  const now = new Date();
  const start = new Date(session.startDate);
  const end = new Date(session.endDate);

  if (now < start) {
    return { label: "À venir", tone: "blue" as const };
  } else if (now >= start && now <= end) {
    return { label: "En cours", tone: "emerald" as const };
  } else {
    return { label: "Terminée", tone: "slate" as const };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const calculateDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "1 jour";
  return `${diffDays + 1} jour${diffDays > 0 ? "s" : ""}`;
};

export function TrainingSessionCard({
  session,
  enrollments,
  employees,
}: TrainingSessionCardProps) {
  const status = getSessionStatus(session);
  const duration = calculateDuration(session.startDate, session.endDate);

  // Count enrollments by status
  const enrolledCount = enrollments.filter(
    (e) => e.status === TrainingStatus.ENROLLED || e.status === TrainingStatus.IN_PROGRESS
  ).length;
  const completedCount = enrollments.filter(
    (e) => e.status === TrainingStatus.COMPLETED
  ).length;

  // Check if session is full
  const isFull = session.maxParticipants
    ? enrolledCount >= session.maxParticipants
    : false;

  // Get enrolled employees
  const enrolledEmployees = enrollments
    .filter((e) => e.status === TrainingStatus.ENROLLED || e.status === TrainingStatus.IN_PROGRESS)
    .slice(0, 3)
    .map((enrollment) => {
      const employee = employees.find((emp) => emp.id === enrollment.employeeId);
      return employee?.profile?.full_name || "Inconnu";
    });

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <header className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            {session.name}
          </h3>
          {session.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </header>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>
            {formatDate(session.startDate)} - {formatDate(session.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{duration}</span>
        </div>

        {session.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{session.location}</span>
          </div>
        )}

        {session.provider && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>{session.provider}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">
            {enrolledCount}
            {session.maxParticipants ? ` / ${session.maxParticipants}` : ""}
          </span>
          <span className="text-sm text-slate-500">inscrits</span>
          {isFull && (
            <StatusBadge label="Complet" tone="amber" dot={false} />
          )}
        </div>

        {completedCount > 0 && (
          <StatusBadge
            label={`${completedCount} certifié${completedCount > 1 ? "s" : ""}`}
            tone="emerald"
            dot={false}
          />
        )}
      </div>

      {enrolledEmployees.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Participants
          </div>
          <div className="flex flex-wrap gap-2">
            {enrolledEmployees.map((name, index) => (
              <span
                key={index}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600"
              >
                {name}
              </span>
            ))}
            {enrolledCount > 3 && (
              <span className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500">
                +{enrolledCount - 3} autres
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
