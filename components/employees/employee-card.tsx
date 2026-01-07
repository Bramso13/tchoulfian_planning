import { StatusBadge } from "@/components/common/status-badge";
import { getEmployeeAvatarClasses } from "@/lib/utils/employee-styling";
import type { Employee } from "@/lib/types";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

type EmployeeCardProps = {
  name: string;
  role: string;
  avatarUrl: string;
  contract: string;
  status: {
    label: string;
    tone:
      | "emerald"
      | "amber"
      | "blue"
      | "rose"
      | "slate"
      | "violet"
      | "teal";
  };
  skills: string[];
  assignments: string;
  employee?: Employee; // Pour accéder aux infos de style
  onClick?: () => void;
  onLockToggle?: (employeeId: string, projectId: string, isLocked: boolean, assignmentId?: string) => Promise<void>;
  lockedProjects?: string[]; // IDs des projets où l'employé est verrouillé
};

export function EmployeeCard({
  name,
  role,
  avatarUrl,
  contract,
  status,
  skills,
  assignments,
  employee,
  onClick,
  onLockToggle,
  lockedProjects = [],
}: EmployeeCardProps) {
  const [isLocking, setIsLocking] = useState(false);
  
  // Obtenir les classes de style si on a l'objet employee
  const avatarClasses = employee 
    ? getEmployeeAvatarClasses(employee, "lg")
    : "h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm";

  // Récupérer les projets où l'employé est assigné
  const employeeProjects = employee?.assignments || [];
  
  const handleLockToggle = async (e: React.MouseEvent, assignmentId: string, projectId: string, currentLocked: boolean) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    if (!onLockToggle || !employee) return;
    
    setIsLocking(true);
    try {
      // Passer l'ID de l'affectation spécifique pour ne verrouiller que celle-ci
      await onLockToggle(employee.id, projectId, !currentLocked, assignmentId);
    } catch (error) {
      console.error("Erreur lors du verrouillage:", error);
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <article
      onClick={onClick}
      className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
    >
      <header className="flex items-center gap-4">
        {employee && avatarUrl ? (
          <div className={avatarClasses}>
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <img
            src={avatarUrl}
            alt={name}
            className={avatarClasses}
          />
        )}
        <div>
          <h3 className="text-base font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <StatusBadge label={status.label} tone={status.tone} />
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
          {contract}
        </span>
        <span>{assignments}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Boutons de verrouillage par projet */}
      {employee && employeeProjects.length > 0 && onLockToggle && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-2">Verrouillage par projet :</div>
          <div className="flex flex-wrap gap-2">
            {employeeProjects.map((assignment) => {
              // Vérifier si cette affectation spécifique est verrouillée
              const isLocked = assignment.isLocked === true;
              
              // Formater la date pour le tooltip
              const formatDate = (date: string | Date | null): string => {
                if (!date) return "Date non définie";
                try {
                  const d = typeof date === 'string' ? new Date(date) : date;
                  if (isNaN(d.getTime())) return "Date invalide";
                  return new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(d);
                } catch {
                  return "Date invalide";
                }
              };

              const startDate = formatDate(assignment.startDate);
              const endDate = assignment.endDate ? formatDate(assignment.endDate) : null;
              const dateRange = endDate 
                ? `Du ${startDate} au ${endDate}`
                : `Le ${startDate}`;
              
              const projectName = assignment.project?.name || "Projet inconnu";
              const tooltipText = `${projectName}\n${dateRange}`;

              return (
                <button
                  key={assignment.id}
                  onClick={(e) => handleLockToggle(e, assignment.id, assignment.projectId, isLocked)}
                  disabled={isLocking}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    isLocked
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  } disabled:opacity-50`}
                  title={tooltipText}
                >
                  {isLocked ? (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Verrouillé</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3" />
                      <span>Déverrouillé</span>
                    </>
                  )}
                  <span className="text-[10px] text-slate-400 ml-1">
                    {projectName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}





