"use client";

import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ContractType, EmployeeStatus, SkillLevel } from "@/lib/types";
import { useDatabase } from "@/app/protected/database-context";
import { createClient } from "@/lib/supabase/client";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SkillInput {
  id: string;
  name: string;
  level: SkillLevel;
  yearsExp: string;
}

type SubmitStatus = "idle" | "success" | "error";

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const {
    createEmployee,
    fetchEmployees,
    employeeMutation,
    departments,
    fetchDepartments,
    createDepartment,
  } = useDatabase();
  const supabase = createClient();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    contractType: ContractType.CDI,
    status: EmployeeStatus.AVAILABLE,
    departmentId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    hireDate: "",
    terminationDate: "",
    birthDate: "",
    availableFrom: "",
    imageUrl: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen, fetchDepartments]);

  const addSkill = () => {
    setSkills([
      ...skills,
      {
        id: Math.random().toString(36).substring(7),
        name: "",
        level: SkillLevel.INTERMEDIATE,
        yearsExp: "",
      },
    ]);
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id));
  };

  const updateSkill = (
    id: string,
    field: keyof SkillInput,
    value: string | SkillLevel
  ) => {
    setSkills(
      skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) return;
    try {
      const newDept = await createDepartment({ name: newDepartmentName });
      setFormData((prev) => ({ ...prev, departmentId: newDept.id }));
      setNewDepartmentName("");
      setShowNewDepartment(false);
    } catch (error) {
      console.error("Erreur lors de la création du département:", error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    try {
      setUploading(true);

      // Vérifier l'authentification
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Vous devez être authentifié pour uploader une photo");
      }

      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${session.user.id}-${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `employees/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("employee-photos")
        .upload(filePath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // Si le bucket n'existe pas, on retourne null au lieu de bloquer
        if (
          uploadError.message?.includes("Bucket not found") ||
          uploadError.message?.includes("bucket")
        ) {
          console.warn(
            "Bucket 'employee-photos' non trouvé. " +
              "Créez-le dans Supabase Storage pour activer l'upload de photos. " +
              "Voir SETUP_STORAGE_BUCKET.md pour les instructions."
          );
          return null; // Permet de continuer sans photo
        }

        throw new Error(
          `Erreur lors de l'upload: ${uploadError.message || "Erreur inconnue"}`
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("employee-photos").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload de la photo:", error);

      // Si c'est une erreur de bucket, on continue sans photo
      if (
        error instanceof Error &&
        (error.message.includes("Bucket not found") ||
          error.message.includes("bucket"))
      ) {
        console.warn("Upload de photo ignoré - bucket non configuré");
        return null;
      }

      throw error; // Propager les autres erreurs
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Upload photo first if exists
      let imageUrl = formData.imageUrl;
      if (photoFile) {
        try {
          const uploadedUrl = await uploadPhoto();
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          } else {
            // Si l'upload a échoué mais que c'est juste le bucket manquant,
            // on continue sans photo plutôt que de bloquer
            console.warn(
              "Création de l'employé sans photo (bucket non configuré)"
            );
          }
        } catch (uploadError) {
          // Seulement bloquer si c'est une vraie erreur (pas juste bucket manquant)
          if (
            uploadError instanceof Error &&
            !uploadError.message.includes("Bucket not found") &&
            !uploadError.message.includes("bucket")
          ) {
            throw new Error(
              uploadError.message ||
                "Erreur lors de l'upload de la photo. Vérifiez votre connexion."
            );
          }
          // Sinon, on continue sans photo
          console.warn("Création de l'employé sans photo");
        }
      }

      // Create employee
      const newEmployee = await createEmployee({
        name: formData.name || null,
        jobTitle: formData.jobTitle,
        contractType: formData.contractType,
        status: formData.status,
        departmentId: formData.departmentId || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postalCode: formData.postalCode || null,
        hireDate: formData.hireDate ? new Date(formData.hireDate) : null,
        terminationDate: formData.terminationDate
          ? new Date(formData.terminationDate)
          : null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        availableFrom: formData.availableFrom
          ? new Date(formData.availableFrom)
          : null,
        imageUrl: imageUrl || null,
        notes: formData.notes || null,
      });

      if (!newEmployee?.id) {
        throw new Error("Erreur lors de la création de l'employé");
      }

      // Create skills for the employee
      if (skills.length > 0) {
        const skillPromises = skills
          .filter((skill) => skill.name.trim())
          .map((skill) =>
            fetch("/api/employees/skills", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                employeeId: newEmployee.id,
                skillName: skill.name,
                level: skill.level,
                yearsExp: skill.yearsExp ? parseInt(skill.yearsExp) : null,
              }),
            }).then((res) => {
              if (!res.ok)
                throw new Error("Erreur lors de l'ajout d'une compétence");
              return res.json();
            })
          );

        await Promise.all(skillPromises);
      }

      // Show success message
      setSubmitStatus("success");

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: "",
          jobTitle: "",
          contractType: ContractType.CDI,
          status: EmployeeStatus.AVAILABLE,
          departmentId: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postalCode: "",
          hireDate: "",
          terminationDate: "",
          birthDate: "",
          availableFrom: "",
          imageUrl: "",
          notes: "",
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        setSkills([]);
        setShowNewDepartment(false);
        setNewDepartmentName("");
        setSubmitStatus("idle");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de l'employé"
      );
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
    <>
      {/* Full Page Success/Error Overlay */}
      {submitStatus === "success" && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-20">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Employé créé avec succès !
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    L'employé a été ajouté à votre base de données avec toutes
                    ses informations et compétences.
                  </p>
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-green-100">
                    <div className="h-full w-full animate-[progress_2s_ease-in-out] bg-green-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-20">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Erreur lors de la création
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus("idle")}
                    className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Réessayer
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus("idle")}
                  className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Ajouter un employé
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {employeeMutation.error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {employeeMutation.error}
              </div>
            )}

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="relative h-32 w-32 overflow-hidden rounded-full bg-slate-200">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Upload className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <label
                  htmlFor="photo"
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  {photoPreview ? "Changer la photo" : "Ajouter une photo"}
                </label>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Format: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Poste <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ex: Chef de chantier"
                />
              </div>

              <div>
                <label
                  htmlFor="contractType"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Type de contrat <span className="text-red-500">*</span>
                </label>
                <select
                  id="contractType"
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={ContractType.CDI}>CDI</option>
                  <option value={ContractType.CDD}>CDD</option>
                  <option value={ContractType.INTERIM}>Intérim</option>
                  <option value={ContractType.FREELANCE}>Freelance</option>
                  <option value={ContractType.SUBCONTRACTOR}>
                    Sous-traitant
                  </option>
                  <option value={ContractType.APPRENTICE}>Apprenti</option>
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
                  <option value={EmployeeStatus.AVAILABLE}>Disponible</option>
                  <option value={EmployeeStatus.ON_MISSION}>En mission</option>
                  <option value={EmployeeStatus.IN_TRAINING}>
                    En formation
                  </option>
                  <option value={EmployeeStatus.ON_LEAVE}>En congé</option>
                  <option value={EmployeeStatus.SICK_LEAVE}>
                    Arrêt maladie
                  </option>
                  <option value={EmployeeStatus.ABSENT}>Absent</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="exemple@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="departmentId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Département
                </label>
                {!showNewDepartment ? (
                  <div className="flex gap-2">
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Aucun département</option>
                      {departments.data.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewDepartment(true)}
                      className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      <Plus className="h-4 w-4" />
                      Nouveau
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      placeholder="Nom du nouveau département"
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleCreateDepartment}
                      disabled={!newDepartmentName.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      Créer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewDepartment(false);
                        setNewDepartmentName("");
                      }}
                      className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="hireDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Date d&apos;embauche
                </label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="birthDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="terminationDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Date de fin de contrat
                </label>
                <input
                  type="date"
                  id="terminationDate"
                  name="terminationDate"
                  value={formData.terminationDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="availableFrom"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Disponible à partir du
                </label>
                <input
                  type="date"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
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

            <div className="grid gap-6 md:grid-cols-2">
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
            </div>

            <div>
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

            {/* Skills Section */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Compétences
                </h3>
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une compétence
                </button>
              </div>

              {skills.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  Aucune compétence ajoutée
                </p>
              ) : (
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex gap-3 rounded-lg bg-white p-3"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) =>
                            updateSkill(skill.id, "name", e.target.value)
                          }
                          placeholder="Nom de la compétence (ex: Maçonnerie)"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="w-40">
                        <select
                          value={skill.level}
                          onChange={(e) =>
                            updateSkill(
                              skill.id,
                              "level",
                              e.target.value as SkillLevel
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value={SkillLevel.BEGINNER}>Débutant</option>
                          <option value={SkillLevel.INTERMEDIATE}>
                            Intermédiaire
                          </option>
                          <option value={SkillLevel.ADVANCED}>Avancé</option>
                          <option value={SkillLevel.EXPERT}>Expert</option>
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={skill.yearsExp}
                          onChange={(e) =>
                            updateSkill(skill.id, "yearsExp", e.target.value)
                          }
                          placeholder="Années"
                          min="0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                disabled={employeeMutation.loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {employeeMutation.loading ? "Création..." : "Créer l'employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
