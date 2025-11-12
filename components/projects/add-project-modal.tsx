"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ProjectType, ProjectStatus } from "@/lib/types";
import { useDatabase } from "@/app/protected/database-context";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
  const { createProject, projectMutation } = useDatabase();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: ProjectType.RESIDENTIAL,
    status: ProjectStatus.PLANNING,
    address: "",
    city: "",
    postalCode: "",
    coordinates: "",
    clientId: "",
    budgetTotal: "",
    budgetConsumed: "",
    startDate: "",
    endDate: "",
    progress: "0",
    projectManagerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProject({
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        status: formData.status,
        address: formData.address || null,
        city: formData.city || null,
        postalCode: formData.postalCode || null,
        coordinates: formData.coordinates || null,
        clientId: formData.clientId || null,
        budgetTotal: formData.budgetTotal ? parseFloat(formData.budgetTotal) : null,
        budgetConsumed: formData.budgetConsumed ? parseFloat(formData.budgetConsumed) : null,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        progress: parseInt(formData.progress) || 0,
        projectManagerId: formData.projectManagerId || null,
      });

      setFormData({
        name: "",
        description: "",
        type: ProjectType.RESIDENTIAL,
        status: ProjectStatus.PLANNING,
        address: "",
        city: "",
        postalCode: "",
        coordinates: "",
        clientId: "",
        budgetTotal: "",
        budgetConsumed: "",
        startDate: "",
        endDate: "",
        progress: "0",
        projectManagerId: "",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Créer un nouveau projet
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {projectMutation.error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {projectMutation.error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Informations générales
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nom du projet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Ex: Résidence Harmony"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Description du projet..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Type de projet <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={ProjectType.RESIDENTIAL}>Résidentiel</option>
                    <option value={ProjectType.COMMERCIAL}>Commercial</option>
                    <option value={ProjectType.INDUSTRIAL}>Industriel</option>
                    <option value={ProjectType.INFRASTRUCTURE}>Infrastructure</option>
                    <option value={ProjectType.RENOVATION}>Rénovation</option>
                    <option value={ProjectType.MEDICAL}>Médical</option>
                    <option value={ProjectType.OTHER}>Autre</option>
                  </select>
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
                    <option value={ProjectStatus.DRAFT}>Brouillon</option>
                    <option value={ProjectStatus.PLANNING}>Planification</option>
                    <option value={ProjectStatus.ACTIVE}>Actif</option>
                    <option value={ProjectStatus.ON_HOLD}>En pause</option>
                    <option value={ProjectStatus.DELAYED}>En retard</option>
                    <option value={ProjectStatus.COMPLETED}>Terminé</option>
                    <option value={ProjectStatus.CANCELLED}>Annulé</option>
                    <option value={ProjectStatus.ARCHIVED}>Archivé</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="progress"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Progression (%)
                  </label>
                  <input
                    type="number"
                    id="progress"
                    name="progress"
                    value={formData.progress}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="projectManagerId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ID Chef de projet
                  </label>
                  <input
                    type="text"
                    id="projectManagerId"
                    name="projectManagerId"
                    value={formData.projectManagerId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="UUID du chef de projet"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Localisation
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Rue, numéro"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="75000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="coordinates"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Coordonnées GPS
                  </label>
                  <input
                    type="text"
                    id="coordinates"
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="48.8566, 2.3522"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Budget et dates
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="budgetTotal"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Budget total (€)
                  </label>
                  <input
                    type="number"
                    id="budgetTotal"
                    name="budgetTotal"
                    value={formData.budgetTotal}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="budgetConsumed"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Budget consommé (€)
                  </label>
                  <input
                    type="number"
                    id="budgetConsumed"
                    name="budgetConsumed"
                    value={formData.budgetConsumed}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Date de fin prévue
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="clientId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ID Client
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="UUID du client (optionnel)"
                  />
                </div>
              </div>
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
              disabled={projectMutation.loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {projectMutation.loading ? "Création..." : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
