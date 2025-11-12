"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Award,
  FileText,
  MessageSquare,
  UserCheck,
} from "lucide-react";

import { PageBanner } from "@/components/common/page-banner";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { ProgressBar } from "@/components/common/progress-bar";
import { useDatabase } from "@/app/protected/database-context";

export default function EmployeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const { employees, assignments, fetchEmployees, fetchAssignments } = useDatabase();

  useEffect(() => {
    fetchEmployees();
    fetchAssignments();
  }, [fetchEmployees, fetchAssignments]);

  const employee = employees.data.find((e) => e.id === employeeId);

  // Get employee assignments
  const employeeAssignments = assignments.data.filter(
    (a) => a.employeeId === employeeId
  );

  // Get current project (most recent active assignment)
  const currentAssignment = employeeAssignments.find(
    (a) => a.project?.status === "ACTIVE"
  );

  if (employees.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-slate-600">
            Chargement des informations de l'employé...
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-slate-600">
            Employé non trouvé
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/protected/dashboard" },
              { label: "Employés", href: "/protected/employes" },
              { label: employee.name || "Employé" },
            ]}
          />
        </div>
      </div>

      <PageBanner
        title={employee.name || "Employé"}
        subtitle={employee.jobTitle || "Aucun rôle spécifié"}
        stats={[
          {
            value: employee.createdAt
              ? `${Math.floor((Date.now() - new Date(employee.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} ans`
              : "N/A",
            label: "Ancienneté",
          },
          {
            value: employeeAssignments.length.toString(),
            label: "Projets",
          },
          { value: "N/A", label: "Satisfaction" },
        ]}
        actions={[
          {
            label: "Planifier une mission",
            icon: <Calendar className="h-4 w-4" />,
            href: "/protected/planning",
          },
          {
            label: "Modifier le profil",
            icon: <FileText className="h-4 w-4" />,
            variant: "secondary",
            onClick: () => {
              alert("Fonctionnalité de modification à implémenter");
            },
          },
        ]}
        rightContent={
          <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={
                  employee.imageUrl ||
                  "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                }
                alt={employee.name || "Employé"}
                className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <div className="space-y-1">
                <StatusBadge
                  label={currentAssignment ? "En mission" : "Disponible"}
                  tone={currentAssignment ? "blue" : "emerald"}
                />
                <p className="text-sm text-slate-600">
                  {currentAssignment
                    ? `Affecté à ${currentAssignment.project?.name}`
                    : "Disponible immédiatement"}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
          <SectionCard title="Informations personnelles">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Email professionnel
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {employee.email || "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Téléphone
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {employee.phone || "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Localisation
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {employee.address || "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Département
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {employee.department?.name || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Affectation actuelle">
            {currentAssignment ? (
              <>
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {currentAssignment.project?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Depuis{" "}
                        {currentAssignment.startDate
                          ? new Date(currentAssignment.startDate).toLocaleDateString(
                              "fr-FR",
                              { month: "short", year: "numeric" }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <StatusBadge label="Mission en cours" tone="blue" />
                  </div>
                  <p className="text-sm text-slate-600">
                    {currentAssignment.role || "Rôle non spécifié"}
                  </p>
                  <ProgressBar
                    value={currentAssignment.project?.progress || 0}
                    tone="blue"
                  />
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="font-semibold text-emerald-700">
                    Fin prévue :{" "}
                    {currentAssignment.endDate
                      ? new Date(currentAssignment.endDate).toLocaleDateString(
                          "fr-FR"
                        )
                      : "Non définie"}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                <p className="font-semibold text-emerald-700">
                  Aucune affectation en cours - Disponible immédiatement
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
          <SectionCard
            title="Parcours professionnel"
            description="Missions principales"
          >
            {employeeAssignments.length > 0 ? (
              <div className="space-y-4">
                {employeeAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {assignment.project?.name || "Projet sans nom"}
                      </p>
                      <StatusBadge
                        label={`${assignment.startDate ? new Date(assignment.startDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "?"} → ${assignment.endDate ? new Date(assignment.endDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "En cours"}`}
                        tone="slate"
                        dot={false}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {assignment.role || "Rôle non spécifié"}
                    </p>
                    {assignment.project && (
                      <p className="mt-1 text-xs text-slate-500">
                        {assignment.project.city || "Lieu non spécifié"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Aucune mission enregistrée
              </div>
            )}
          </SectionCard>

          <SectionCard title="Compétences & certifications">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Compétences clés
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {employee.skills && employee.skills.length > 0 ? (
                    employee.skills.map((employeeSkill, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600"
                      >
                        {employeeSkill.skill?.name || "Compétence"}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Aucune compétence enregistrée
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {employee.certifications && employee.certifications.length > 0 ? (
                  employee.certifications.map((employeeCertification, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <Award className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {employeeCertification.certificationName || "Certification"}
                        </p>
                        {employeeCertification.issueDate && (
                          <p className="text-xs text-slate-500">
                            {new Date(employeeCertification.issueDate).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-slate-500">
                    Aucune certification enregistrée
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,1fr]">
          <SectionCard title="Feedback & évaluations">
            <div className="py-8 text-center text-sm text-slate-500">
              Les évaluations de performance seront disponibles prochainement
            </div>
          </SectionCard>

          <SectionCard
            title="Documents"
            action={
              <button
                onClick={() => {
                  alert("Fonctionnalité d'ajout de documents à implémenter");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
              >
                Ajouter un document
              </button>
            }
          >
            <div className="py-8 text-center text-sm text-slate-500">
              Aucun document disponible
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Suivi & communication">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <MessageSquare className="mt-1 h-5 w-5 text-blue-500" />
              <div>
                <p className="font-semibold text-slate-900">Notes</p>
                <p className="text-sm text-slate-500">
                  {employee.notes || "Aucune note disponible"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
              <UserCheck className="mt-1 h-5 w-5 text-blue-500" />
              <div>
                <p className="font-semibold text-slate-900">Informations</p>
                <p className="text-sm text-slate-600">
                  Date de création :{" "}
                  {employee.createdAt
                    ? new Date(employee.createdAt).toLocaleDateString("fr-FR")
                    : "Non disponible"}
                </p>
                {employee.updatedAt && (
                  <p className="text-sm text-slate-600">
                    Dernière modification :{" "}
                    {new Date(employee.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    </>
  );
}
