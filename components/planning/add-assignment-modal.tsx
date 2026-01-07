"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AssignmentStatus, EmployeeStatus } from "@/lib/types";
import { useDatabase } from "@/app/protected/database-context";

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedEmployeeId?: string;
  preSelectedProjectId?: string;
  preSelectedDate?: string;
}

export function AddAssignmentModal({
  isOpen,
  onClose,
  preSelectedEmployeeId,
  preSelectedProjectId,
  preSelectedDate,
}: AddAssignmentModalProps) {
  const {
    createAssignment,
    assignmentMutation,
    employees,
    projects,
    fetchEmployees,
    fetchProjects,
  } = useDatabase();

  const [formData, setFormData] = useState({
    employeeId: preSelectedEmployeeId || "",
    projectId: preSelectedProjectId || "",
    role: "",
    startDate: preSelectedDate || "",
    endDate: "",
    startTime: "08:00",
    endTime: "17:00",
    status: AssignmentStatus.CONFIRMED,
    plannedHours: "8",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      fetchProjects();

      // Reset form with pre-selected values
      setFormData({
        employeeId: preSelectedEmployeeId || "",
        projectId: preSelectedProjectId || "",
        role: "",
        startDate: preSelectedDate || "",
        endDate: "",
        startTime: "08:00",
        endTime: "17:00",
        status: AssignmentStatus.CONFIRMED,
        plannedHours: "8",
        notes: "",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const startDateTime = formData.startTime
        ? new Date(`${formData.startDate}T${formData.startTime}`)
        : null;
      const endDateTime = formData.endTime
        ? new Date(
            `${formData.endDate || formData.startDate}T${formData.endTime}`
          )
        : null;

      await createAssignment({
        employeeId: formData.employeeId,
        projectId: formData.projectId,
        role: formData.role || null,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        startTime: startDateTime,
        endTime: endDateTime,
        status: formData.status,
        plannedHours: formData.plannedHours
          ? parseFloat(formData.plannedHours)
          : null,
        notes: formData.notes || null,
      });

      setFormData({
        employeeId: "",
        projectId: "",
        role: "",
        startDate: "",
        endDate: "",
        startTime: "08:00",
        endTime: "17:00",
        status: AssignmentStatus.CONFIRMED,
        plannedHours: "8",
        notes: "",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de l'affectation:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const selectedEmployee = employees.data.find(
    (e) => e.id === formData.employeeId
  );
  const selectedProject = projects.data.find(
    (p) => p.id === formData.projectId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Nouvelle affectation
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {assignmentMutation.error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {assignmentMutation.error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="employeeId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Employé <span className="text-red-500">*</span>
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Sélectionner un employé</option>
                {employees.data
                  .filter(
                    (e) =>
                      e.status !== EmployeeStatus.TERMINATED &&
                      e.status !== EmployeeStatus.ABSENT
                  )
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.profile?.full_name || employee.name || "Sans nom"} -{" "}
                      {employee.jobTitle || "Non renseigné"}
                    </option>
                  ))}
              </select>
              {selectedEmployee && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedEmployee.contractType} • {selectedEmployee.status}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="projectId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Chantier <span className="text-red-500">*</span>
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Sélectionner un chantier</option>
                {projects.data.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.city}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedProject.type} • {selectedProject.status}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Rôle sur le chantier
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ex: Chef d'équipe"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={AssignmentStatus.SCHEDULED}>Planifié</option>
                <option value={AssignmentStatus.CONFIRMED}>Confirmé</option>
                <option value={AssignmentStatus.IN_PROGRESS}>En cours</option>
                <option value={AssignmentStatus.COMPLETED}>Terminé</option>
                <option value={AssignmentStatus.DELAYED}>En retard</option>
                <option value={AssignmentStatus.CANCELLED}>Annulé</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="plannedHours"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Heures planifiées
              </label>
              <input
                type="number"
                id="plannedHours"
                name="plannedHours"
                value={formData.plannedHours}
                onChange={handleChange}
                step="0.5"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="8.0"
              />
            </div>

            <div>
              <label
                htmlFor="startTime"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Heure de début
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Heure de fin
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={assignmentMutation.loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {assignmentMutation.loading
                ? "Création..."
                : "Créer l'affectation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
