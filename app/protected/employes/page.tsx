"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Filter,
  List,
  Grid3x3,
  Search,
  UserPlus,
  Briefcase,
  Building2,
  Award,
} from "lucide-react";

import { PageBanner } from "@/components/common/page-banner";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { EmployeeCard } from "@/components/employees/employee-card";
import { StatusBadge } from "@/components/common/status-badge";
import { AddEmployeeModal } from "@/components/employees/add-employee-modal";
import { useDatabase } from "@/app/protected/database-context";
import { ContractType, EmployeeStatus } from "@/lib/types";

type ContractFilterValue = ContractType | "ALL";
type StatusFilterValue = EmployeeStatus | "ALL";

const contractFilterOptions: Array<{
  label: string;
  value: ContractFilterValue;
}> = [
  { label: "Tous", value: "ALL" },
  { label: "CDI", value: ContractType.CDI },
  { label: "Intérim", value: ContractType.INTERIM },
  { label: "Sous-traitants", value: ContractType.SUBCONTRACTOR },
];

const contractLabels: Record<ContractType, string> = {
  [ContractType.CDI]: "CDI",
  [ContractType.CDD]: "CDD",
  [ContractType.INTERIM]: "Intérim",
  [ContractType.FREELANCE]: "Freelance",
  [ContractType.SUBCONTRACTOR]: "Sous-traitant",
  [ContractType.APPRENTICE]: "Apprenti",
};

const getStatusLabel = (status: EmployeeStatus) => {
  const statusMap: Record<
    EmployeeStatus,
    { label: string; tone: "emerald" | "blue" | "amber" | "rose" | "slate" }
  > = {
    [EmployeeStatus.AVAILABLE]: { label: "Disponible", tone: "emerald" },
    [EmployeeStatus.ON_MISSION]: { label: "En mission", tone: "blue" },
    [EmployeeStatus.IN_TRAINING]: { label: "En formation", tone: "amber" },
    [EmployeeStatus.ON_LEAVE]: { label: "En congé", tone: "slate" },
    [EmployeeStatus.SICK_LEAVE]: { label: "Arrêt maladie", tone: "rose" },
    [EmployeeStatus.ABSENT]: { label: "Absent", tone: "rose" },
    [EmployeeStatus.TERMINATED]: { label: "Terminé", tone: "slate" },
  };
  return statusMap[status];
};

export default function EmployesPage() {
  const router = useRouter();
  const {
    employees,
    fetchEmployees,
    departments,
    fetchDepartments,
    skills,
    fetchSkills,
  } = useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contractFilter, setContractFilter] =
    useState<ContractFilterValue>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [skillFilter, setSkillFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setContractFilter("ALL");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setSkillFilter("ALL");
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchSkills();
  }, [fetchEmployees, fetchDepartments, fetchSkills]);

  const departmentOptions = useMemo(
    () =>
      departments.data
        .map((department) => ({
          id: department.id,
          name: department.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [departments.data]
  );

  const skillOptions = useMemo(() => {
    const uniqueSkills = new Map<string, string>();

    skills.data.forEach((employeeSkill) => {
      const skillId = employeeSkill.skill?.id;
      const skillName = employeeSkill.skill?.name;

      if (skillId && skillName) {
        uniqueSkills.set(skillId, skillName);
      }
    });

    employees.data.forEach((employee) => {
      employee.skills.forEach((employeeSkill) => {
        const skillId = employeeSkill.skill?.id;
        const skillName = employeeSkill.skill?.name;

        if (skillId && skillName) {
          uniqueSkills.set(skillId, skillName);
        }
      });
    });

    return Array.from(uniqueSkills.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees.data, skills.data]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return employees.data.filter((employee) => {
      if (
        contractFilter !== "ALL" &&
        employee.contractType !== contractFilter
      ) {
        return false;
      }

      if (statusFilter !== "ALL" && employee.status !== statusFilter) {
        return false;
      }

      if (
        departmentFilter !== "ALL" &&
        employee.departmentId !== departmentFilter
      ) {
        return false;
      }

      if (skillFilter !== "ALL") {
        const hasSkill = employee.skills.some(
          (employeeSkill) => employeeSkill.skill?.id === skillFilter
        );

        if (!hasSkill) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues: string[] = [];

      if (employee.name) {
        searchableValues.push(employee.name);
      }

      if (employee.profile?.full_name) {
        searchableValues.push(employee.profile.full_name);
      }

      if (employee.jobTitle) {
        searchableValues.push(employee.jobTitle);
      }

      if (employee.department?.name) {
        searchableValues.push(employee.department.name);
      }

      searchableValues.push(contractLabels[employee.contractType]);

      employee.skills.forEach((employeeSkill) => {
        const skillName = employeeSkill.skill?.name;
        if (skillName) {
          searchableValues.push(skillName);
        }
      });

      employee.assignments.forEach((assignment) => {
        const projectName = assignment.project?.name;
        if (projectName) {
          searchableValues.push(projectName);
        }
      });

      const haystack = searchableValues.join(" ").toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [
    contractFilter,
    departmentFilter,
    employees.data,
    searchTerm,
    skillFilter,
    statusFilter,
  ]);

  const totalEmployees = employees.data.length;
  const cdiCount = employees.data.filter(
    (emp) => emp.contractType === ContractType.CDI
  ).length;
  const interimCount = employees.data.filter(
    (emp) => emp.contractType === ContractType.INTERIM
  ).length;
  const inTrainingCount = employees.data.filter(
    (emp) => emp.status === EmployeeStatus.IN_TRAINING
  ).length;

  const employeeStats = [
    {
      title: "Total employés",
      value: totalEmployees.toString(),
      subtitle: "Effectif global",
      icon: <Briefcase className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "CDI",
      value: cdiCount.toString(),
      subtitle: "Équipe permanente",
      icon: <Building2 className="h-5 w-5 text-emerald-500" />,
    },
    {
      title: "Intérimaires",
      value: interimCount.toString(),
      subtitle: "Renforts en cours",
      icon: <Award className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "En formation",
      value: inTrainingCount.toString(),
      subtitle: "Actuellement",
      icon: <Filter className="h-5 w-5 text-violet-500" />,
    },
  ];
  const visibleEmployees = filteredEmployees.length;
  const hasActiveFilters =
    searchTerm.length > 0 ||
    contractFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    departmentFilter !== "ALL" ||
    skillFilter !== "ALL";

  const employeesGridLayout =
    viewMode === "grid"
      ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      : "grid gap-6";
  return (
    <>
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <PageBanner
        title="Annuaire des employés"
        subtitle="Gérez votre équipe et suivez les informations de vos collaborateurs"
        stats={[
          { value: `CDI : ${cdiCount}`, label: "Employés permanents" },
          { value: `Intérim : ${interimCount}`, label: "Renforts en mission" },
        ]}
        actions={[
          {
            label: "Ajouter un employé",
            icon: <UserPlus className="h-4 w-4" />,
            onClick: () => setIsModalOpen(true),
          },
          {
            label: "Exporter",
            icon: <Download className="h-4 w-4" />,
            variant: "secondary",
            onClick: () => {
              alert("Fonctionnalité d'export à implémenter");
            },
          },
        ]}
      />

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {employeeStats.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <SectionCard
          title="Recherche & filtres"
          description="Affinez vos résultats"
          action={
            <button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
              aria-pressed={showAdvancedFilters}
            >
              <Filter className="h-4 w-4" />
              {showAdvancedFilters ? "Masquer les filtres" : "Filtres avancés"}
            </button>
          }
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher par nom, poste ou compétence..."
                className="h-12 w-full rounded-xl border border-transparent bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-600 transition focus:border-blue-500/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-1">
              <button
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === "list"
                    ? "bg-white font-semibold text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                Liste
              </button>
              <button
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === "grid"
                    ? "bg-white font-semibold text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
                Grille
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {contractFilterOptions.map((filterOption) => {
              const isActive = contractFilter === filterOption.value;

              return (
                <button
                  key={filterOption.label}
                  onClick={() => setContractFilter(filterOption.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  {filterOption.label}
                </button>
              );
            })}
          </div>
          {showAdvancedFilters && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statut
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as StatusFilterValue)
                    }
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">Tous les statuts</option>
                    {Object.values(EmployeeStatus).map((status) => {
                      const statusInfo = getStatusLabel(status);
                      return (
                        <option key={status} value={status}>
                          {statusInfo.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Département
                  </span>
                  <select
                    value={departmentFilter}
                    onChange={(event) =>
                      setDepartmentFilter(event.target.value)
                    }
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">Tous les départements</option>
                    {departmentOptions.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Compétence
                  </span>
                  <select
                    value={skillFilter}
                    onChange={(event) => setSkillFilter(event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">Toutes les compétences</option>
                    {skillOptions.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-500 hover:text-rose-600"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Équipe"
          description="Dernières mises à jour"
          action={
            <StatusBadge
              label={`${visibleEmployees} résultat${
                visibleEmployees > 1 ? "s" : ""
              }`}
              tone="blue"
            />
          }
        >
          {employees.loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Chargement des employés...
            </div>
          ) : employees.error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              Erreur : {employees.error}
            </div>
          ) : employees.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                Aucun employé trouvé. Ajoutez-en un pour commencer.
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                Aucun résultat ne correspond à vos filtres actuels.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className={employeesGridLayout}>
              {filteredEmployees.map((employee) => {
                const statusInfo = getStatusLabel(employee.status);
                const assignmentInfo = employee.assignments[0]
                  ? `Projet : ${employee.assignments[0].project?.name || "N/A"}`
                  : "Aucune affectation";
                const skills = employee.skills.map((s) => s.skill?.name || "");

                return (
                  <EmployeeCard
                    key={employee.id}
                    name={
                      employee.name ||
                      employee.profile?.full_name ||
                      "Sans nom"
                    }
                    role={employee.jobTitle}
                    avatarUrl={
                      employee.imageUrl ||
                      employee.profile?.avatar_url ||
                      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                    }
                    contract={employee.contractType}
                    status={statusInfo}
                    assignments={assignmentInfo}
                    skills={skills.slice(0, 3)}
                    onClick={() => router.push(`/protected/employes/${employee.id}`)}
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
