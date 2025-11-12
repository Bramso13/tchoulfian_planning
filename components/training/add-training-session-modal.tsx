"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useDatabase } from "@/app/protected/database-context";

interface AddTrainingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTrainingSessionModal({
  isOpen,
  onClose,
}: AddTrainingSessionModalProps) {
  const { createTrainingSession, trainingSessionMutation } = useDatabase();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    provider: "",
    startDate: "",
    endDate: "",
    maxParticipants: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTrainingSession({
        name: formData.name,
        description: formData.description || null,
        location: formData.location || null,
        provider: formData.provider || null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : null,
      });

      setFormData({
        name: "",
        description: "",
        location: "",
        provider: "",
        startDate: "",
        endDate: "",
        maxParticipants: "",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la formation:", error);
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Créer une session de formation
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {trainingSessionMutation.error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {trainingSessionMutation.error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nom de la formation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ex: Formation sécurité chantier"
            />
          </div>

          <div>
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
              placeholder="Détails de la formation..."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="provider"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Organisme formateur
              </label>
              <input
                type="text"
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nom de l'organisme"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Lieu
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ville ou adresse"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Date de début <span className="text-red-500">*</span>
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
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="maxParticipants"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nombre maximum de participants
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min="1"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ex: 15"
            />
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
              disabled={trainingSessionMutation.loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {trainingSessionMutation.loading
                ? "Création..."
                : "Créer la formation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
