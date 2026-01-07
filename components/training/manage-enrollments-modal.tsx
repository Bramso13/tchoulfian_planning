"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, UserMinus } from "lucide-react";
import { useDatabase } from "@/app/protected/database-context";
import type { TrainingSession, Employee } from "@/lib/types";
import { TrainingStatus } from "@/lib/types";
import { getEmployeeAvatarClasses } from "@/lib/utils/employee-styling";

interface ManageEnrollmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession;
}

export function ManageEnrollmentsModal({
  isOpen,
  onClose,
  session,
}: ManageEnrollmentsModalProps) {
  const {
    employees,
    trainingEnrollments,
    fetchEmployees,
    fetchTrainingEnrollments,
    createTrainingEnrollment,
    deleteTrainingEnrollment,
    trainingEnrollmentMutation,
  } = useDatabase();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchTrainingEnrollments();
    }
  }, [isOpen, fetchEmployees, fetchTrainingEnrollments]);

  // Récupérer les inscriptions de cette session
  const sessionEnrollments = trainingEnrollments.data.filter(
    (e) => e.trainingSessionId === session.id
  );

  // Récupérer les employés déjà inscrits
  const enrolledEmployeeIds = new Set(
    sessionEnrollments.map((e) => e.employeeId)
  );

  // Filtrer les employés disponibles (non inscrits)
  const availableEmployees = employees.data.filter(
    (e) => !enrolledEmployeeIds.has(e.id)
  );

  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) return;

    try {
      await createTrainingEnrollment({
        employeeId: selectedEmployeeId,
        trainingSessionId: session.id,
        status: TrainingStatus.ENROLLED,
      });
      setSelectedEmployeeId("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
    }
  };

  const handleRemoveEmployee = async (enrollmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cet employé de la formation ?")) {
      return;
    }

    try {
      await deleteTrainingEnrollment(enrollmentId);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'inscription:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Gérer les participants
            </h2>
            <p className="text-sm text-slate-500 mt-1">{session.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {trainingEnrollmentMutation.error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {trainingEnrollmentMutation.error}
            </div>
          )}

          {/* Ajouter un employé */}
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Ajouter un participant
            </h3>
            <div className="flex gap-2">
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Sélectionner un employé</option>
                {availableEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.profile?.full_name || employee.name || "Sans nom"} - {employee.jobTitle}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddEmployee}
                disabled={!selectedEmployeeId || trainingEnrollmentMutation.loading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4" />
                Ajouter
              </button>
            </div>
            {availableEmployees.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Tous les employés sont déjà inscrits à cette formation
              </p>
            )}
          </div>

          {/* Liste des participants */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Participants ({sessionEnrollments.length}
              {session.maxParticipants ? ` / ${session.maxParticipants}` : ""})
            </h3>
            {sessionEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                Aucun participant inscrit
              </p>
            ) : (
              <div className="space-y-2">
                {sessionEnrollments.map((enrollment) => {
                  // Chercher l'employé dans les données enrichies de l'enrollment ou dans la liste
                  const employee = enrollment.employee || employees.data.find(
                    (e) => e.id === enrollment.employeeId
                  );
                  
                  const employeeName = employee?.profile?.full_name || employee?.name || "Inconnu";
                  const employeeInitial = employee?.profile?.full_name?.[0] || employee?.name?.[0] || "?";
                  
                  const avatarClasses = employee 
                    ? getEmployeeAvatarClasses(employee, "sm")
                    : "h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600";

                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={avatarClasses}>
                          {employee?.imageUrl ? (
                            <img
                              src={employee.imageUrl}
                              alt={employeeName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            employeeInitial
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {employeeName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {employee?.jobTitle || "Non renseigné"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {enrollment.status === TrainingStatus.COMPLETED
                            ? "Terminé"
                            : enrollment.status === TrainingStatus.IN_PROGRESS
                            ? "En cours"
                            : "Inscrit"}
                        </span>
                        <button
                          onClick={() => handleRemoveEmployee(enrollment.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Retirer de la formation"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

