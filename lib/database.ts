/**
 * TCHOULFIAN PLANNING - Database Utilities
 * Remplacement de Prisma par Supabase Client direct
 */

import { createClient } from '@supabase/supabase-js';

// Types générés à partir du schéma
export type Role = 'USER' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN';
export type ContractType = 'CDI' | 'CDD' | 'INTERIM' | 'FREELANCE' | 'SUBCONTRACTOR' | 'APPRENTICE';
export type EmployeeStatus = 'AVAILABLE' | 'ON_MISSION' | 'IN_TRAINING' | 'ON_LEAVE' | 'SICK_LEAVE' | 'ABSENT' | 'TERMINATED';
export type ProjectStatus = 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'DELAYED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type ProjectType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'INFRASTRUCTURE' | 'RENOVATION' | 'MEDICAL' | 'OTHER';
export type AssignmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
export type DocumentCategory = 'CONTRACT' | 'CERTIFICATION' | 'RESUME' | 'SECURITY' | 'PLANNING' | 'FINANCE' | 'TECHNICAL' | 'REPORT' | 'OTHER';
export type ActivityType = 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'PROJECT_STATUS_CHANGED' | 'EMPLOYEE_ASSIGNED' | 'EMPLOYEE_UNASSIGNED' | 'MILESTONE_COMPLETED' | 'DOCUMENT_UPLOADED' | 'EVALUATION_ADDED' | 'ALERT_CREATED' | 'ALERT_RESOLVED' | 'COMMENT_ADDED' | 'TRAINING_ENROLLED' | 'TRAINING_COMPLETED';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type TrainingStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Interfaces des tables
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: Role | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  profileId: string | null;
  jobTitle: string;
  contractType: ContractType;
  status: EmployeeStatus;
  departmentId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  imageUrl: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  birthDate: string | null;
  availableFrom: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  level: SkillLevel;
  yearsExp: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  name: string;
  issuer: string | null;
  certNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  documentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  coordinates: string | null;
  clientId: string | null;
  budgetTotal: number | null;
  budgetConsumed: number | null;
  startDate: string | null;
  endDate: string | null;
  actualEndDate: string | null;
  progress: number;
  projectManagerId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  role: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  status: AssignmentStatus;
  plannedHours: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  status: MilestoneStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  provider: string | null;
  startDate: string;
  endDate: string;
  maxParticipants: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  employeeId: string;
  trainingSessionId: string;
  status: TrainingStatus;
  enrolledAt: string;
  completedAt: string | null;
  certificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  description: string | null;
  category: DocumentCategory;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  employeeId: string | null;
  projectId: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  projectId: string | null;
  title: string;
  content: string;
  score: number | null;
  evaluatorId: string | null;
  evaluatorName: string | null;
  evaluationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  employeeId: string | null;
  projectId: string | null;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Alert {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  description: string | null;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Type pour la base de données complète
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Profile>;
      };
      Department: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Department>;
      };
      Employee: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Employee>;
      };
      Skill: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Skill>;
      };
      EmployeeSkill: {
        Row: EmployeeSkill;
        Insert: Omit<EmployeeSkill, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<EmployeeSkill>;
      };
      EmployeeCertification: {
        Row: EmployeeCertification;
        Insert: Omit<EmployeeCertification, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<EmployeeCertification>;
      };
      Client: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Client>;
      };
      Project: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Project>;
      };
      Assignment: {
        Row: Assignment;
        Insert: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Assignment>;
      };
      Milestone: {
        Row: Milestone;
        Insert: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Milestone>;
      };
      TrainingSession: {
        Row: TrainingSession;
        Insert: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<TrainingSession>;
      };
      TrainingEnrollment: {
        Row: TrainingEnrollment;
        Insert: Omit<TrainingEnrollment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<TrainingEnrollment>;
      };
      Document: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Document>;
      };
      Evaluation: {
        Row: Evaluation;
        Insert: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Evaluation>;
      };
      Activity: {
        Row: Activity;
        Insert: Omit<Activity, 'id' | 'createdAt'> & { id?: string; createdAt?: string };
        Update: Partial<Activity>;
      };
      Alert: {
        Row: Alert;
        Insert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<Alert>;
      };
      TimeEntry: {
        Row: TimeEntry;
        Insert: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string };
        Update: Partial<TimeEntry>;
      };
    };
    Enums: {
      Role: Role;
      ContractType: ContractType;
      EmployeeStatus: EmployeeStatus;
      ProjectStatus: ProjectStatus;
      ProjectType: ProjectType;
      AssignmentStatus: AssignmentStatus;
      MilestoneStatus: MilestoneStatus;
      DocumentCategory: DocumentCategory;
      ActivityType: ActivityType;
      SkillLevel: SkillLevel;
      TrainingStatus: TrainingStatus;
      AlertSeverity: AlertSeverity;
    };
  };
}

// Helper pour créer un client Supabase typé
export function createTypedClient(supabaseUrl: string, supabaseKey: string) {
  return createClient<Database>(supabaseUrl, supabaseKey);
}

// Traductions des enums pour l'interface utilisateur
export const ContractTypeLabels: Record<ContractType, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  INTERIM: 'Intérimaire',
  FREELANCE: 'Freelance',
  SUBCONTRACTOR: 'Sous-traitant',
  APPRENTICE: 'Apprenti',
};

export const EmployeeStatusLabels: Record<EmployeeStatus, string> = {
  AVAILABLE: 'Disponible',
  ON_MISSION: 'En mission',
  IN_TRAINING: 'En formation',
  ON_LEAVE: 'En congé',
  SICK_LEAVE: 'Arrêt maladie',
  ABSENT: 'Absent',
  TERMINATED: 'Terminé',
};

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  DRAFT: 'Brouillon',
  PLANNING: 'En planification',
  ACTIVE: 'En cours',
  ON_HOLD: 'En pause',
  DELAYED: 'En retard',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  ARCHIVED: 'Archivé',
};

export const ProjectTypeLabels: Record<ProjectType, string> = {
  RESIDENTIAL: 'Résidentiel',
  COMMERCIAL: 'Commercial',
  INDUSTRIAL: 'Industriel',
  INFRASTRUCTURE: 'Infrastructure',
  RENOVATION: 'Rénovation',
  MEDICAL: 'Médical',
  OTHER: 'Autre',
};

export const AssignmentStatusLabels: Record<AssignmentStatus, string> = {
  SCHEDULED: 'Planifié',
  CONFIRMED: 'Confirmé',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  DELAYED: 'En retard',
  CANCELLED: 'Annulé',
};

export const MilestoneStatusLabels: Record<MilestoneStatus, string> = {
  PENDING: 'À venir',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  DELAYED: 'En retard',
  CANCELLED: 'Annulé',
};

export const SkillLevelLabels: Record<SkillLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

export const AlertSeverityLabels: Record<AlertSeverity, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

export const RoleLabels: Record<Role, string> = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  SUPER_ADMIN: 'Super Admin',
};

// Couleurs pour les statuts (Tailwind classes)
export const ProjectStatusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  DELAYED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
  ARCHIVED: 'bg-slate-100 text-slate-600',
};

export const EmployeeStatusColors: Record<EmployeeStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ON_MISSION: 'bg-blue-100 text-blue-800',
  IN_TRAINING: 'bg-purple-100 text-purple-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  SICK_LEAVE: 'bg-orange-100 text-orange-800',
  ABSENT: 'bg-red-100 text-red-800',
  TERMINATED: 'bg-gray-100 text-gray-500',
};

export const AlertSeverityColors: Record<AlertSeverity, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};


