import type { Employee } from "@/lib/types";
import { ContractType } from "@/lib/types";

/**
 * Retourne les classes CSS pour la bordure et le fond selon le type de contrat
 */
export function getEmployeeColorCode(employee: Employee) {
  switch (employee.contractType) {
    case ContractType.CDI:
      return {
        border: "border-blue-500",
        bg: "bg-blue-100",
        text: "text-blue-600",
        dot: "bg-blue-500",
      };
    case ContractType.CDD:
      return {
        border: "border-amber-500",
        bg: "bg-amber-100",
        text: "text-amber-600",
        dot: "bg-amber-500",
      };
    case ContractType.INTERIM:
      return {
        border: "border-rose-500",
        bg: "bg-rose-100",
        text: "text-rose-600",
        dot: "bg-rose-500",
      };
    case ContractType.FREELANCE:
      return {
        border: "border-violet-500",
        bg: "bg-violet-100",
        text: "text-violet-600",
        dot: "bg-violet-500",
      };
    case ContractType.SUBCONTRACTOR:
      return {
        border: "border-slate-500",
        bg: "bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-500",
      };
    case ContractType.APPRENTICE:
      return {
        border: "border-emerald-500",
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
      };
    default:
      return {
        border: "border-slate-300",
        bg: "bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-400",
      };
  }
}

/**
 * Retourne la forme de l'avatar selon le type de contrat
 * Chaque type de contrat a une forme différente pour une identification visuelle rapide
 */
export function getEmployeeShape(employee: Employee): string {
  switch (employee.contractType) {
    case ContractType.CDI:
      return "rounded-full"; // Cercle complet pour CDI
    case ContractType.CDD:
      return "rounded-lg"; // Coins arrondis moyens pour CDD
    case ContractType.INTERIM:
      return "rounded-none"; // Carré pour Intérim
    case ContractType.FREELANCE:
      return "rounded-xl"; // Grands coins arrondis pour Freelance
    case ContractType.SUBCONTRACTOR:
      return "rounded-md"; // Coins arrondis petits pour Sous-traitant
    case ContractType.APPRENTICE:
      return "rounded-2xl"; // Très grands coins arrondis pour Apprenti
    default:
      return "rounded-full"; // Par défaut, cercle
  }
}

/**
 * Retourne les classes complètes pour l'avatar avec bordure colorée
 */
export function getEmployeeAvatarClasses(employee: Employee, size: "sm" | "md" | "lg" = "md"): string {
  const colorCode = getEmployeeColorCode(employee);
  const shape = getEmployeeShape(employee);
  
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-14 w-14 border-4",
  };

  return `${sizeClasses[size]} ${shape} ${colorCode.border} ${colorCode.bg} flex items-center justify-center text-xs font-semibold ${colorCode.text} overflow-hidden`;
}

/**
 * Retourne les classes pour un badge/point indicateur
 */
export function getEmployeeIndicatorDot(employee: Employee): string {
  const colorCode = getEmployeeColorCode(employee);
  return `h-3 w-3 ${colorCode.dot} rounded-full`;
}

