// ============================================================================
// ENUMÉRATIONS (schéma public)
// ============================================================================

export enum ContractType {
  CDI = "CDI",
  CDD = "CDD",
  INTERIM = "INTERIM",
  FREELANCE = "FREELANCE",
  SUBCONTRACTOR = "SUBCONTRACTOR",
  APPRENTICE = "APPRENTICE",
}

export enum EmployeeStatus {
  AVAILABLE = "AVAILABLE",
  ON_MISSION = "ON_MISSION",
  IN_TRAINING = "IN_TRAINING",
  ON_LEAVE = "ON_LEAVE",
  SICK_LEAVE = "SICK_LEAVE",
  ABSENT = "ABSENT",
  TERMINATED = "TERMINATED",
}

export enum ProjectStatus {
  DRAFT = "DRAFT",
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  DELAYED = "DELAYED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  ARCHIVED = "ARCHIVED",
}

export enum ProjectType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  INDUSTRIAL = "INDUSTRIAL",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  RENOVATION = "RENOVATION",
  MEDICAL = "MEDICAL",
  OTHER = "OTHER",
}

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DELAYED = "DELAYED",
  CANCELLED = "CANCELLED",
}

export enum MilestoneStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DELAYED = "DELAYED",
  CANCELLED = "CANCELLED",
}

export enum DocumentCategory {
  CONTRACT = "CONTRACT",
  CERTIFICATION = "CERTIFICATION",
  RESUME = "RESUME",
  SECURITY = "SECURITY",
  PLANNING = "PLANNING",
  FINANCE = "FINANCE",
  TECHNICAL = "TECHNICAL",
  REPORT = "REPORT",
  OTHER = "OTHER",
}

export enum ActivityType {
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_STATUS_CHANGED = "PROJECT_STATUS_CHANGED",
  EMPLOYEE_ASSIGNED = "EMPLOYEE_ASSIGNED",
  EMPLOYEE_UNASSIGNED = "EMPLOYEE_UNASSIGNED",
  MILESTONE_COMPLETED = "MILESTONE_COMPLETED",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
  EVALUATION_ADDED = "EVALUATION_ADDED",
  ALERT_CREATED = "ALERT_CREATED",
  ALERT_RESOLVED = "ALERT_RESOLVED",
  COMMENT_ADDED = "COMMENT_ADDED",
  TRAINING_ENROLLED = "TRAINING_ENROLLED",
  TRAINING_COMPLETED = "TRAINING_COMPLETED",
}

export enum SkillLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT",
}

export enum TrainingStatus {
  ENROLLED = "ENROLLED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

export type JsonValue = any;

// ============================================================================
// MODÈLES (schéma public)
// ============================================================================

export interface profiles {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: Role | null;
  created_at: Date | null;
  updated_at: Date | null;
  user: users;
  employee: Employee[];
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  employees: Employee[];
  manager: Employee[];
}

export interface Employee {
  id: string;
  profileId: string | null;
  name: string | null;
  jobTitle: string;
  contractType: ContractType;
  status: EmployeeStatus;
  departmentId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  imageUrl: string | null;
  hireDate: Date | null;
  terminationDate: Date | null;
  birthDate: Date | null;
  availableFrom: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  profile: profiles | null;
  department: Department | null;
  managedDepartment: Department[];
  assignments: Assignment[];
  skills: EmployeeSkill[];
  certifications: EmployeeCertification[];
  evaluations: Evaluation[];
  documents: Document[];
  activities: Activity[];
  timeEntries: TimeEntry[];
  trainingEnrollments: TrainingEnrollment[];
  managedProjects: Project[];
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  employees: EmployeeSkill[];
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  level: SkillLevel;
  yearsExp: number | null;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
  skill: Skill;
}

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  name: string;
  issuer: string | null;
  certNumber: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
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
  createdAt: Date;
  updatedAt: Date;
  projects: Project[];
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
  budgetTotal: any | null;
  budgetConsumed: any | null;
  startDate: Date | null;
  endDate: Date | null;
  actualEndDate: Date | null;
  progress: number;
  projectManagerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  client: Client | null;
  projectManager: Employee | null;
  assignments: Assignment[];
  milestones: Milestone[];
  documents: Document[];
  activities: Activity[];
  alerts: Alert[];
  timeEntries: TimeEntry[];
}

export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  role: string | null;
  startDate: Date;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  status: AssignmentStatus;
  plannedHours: any | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
  project: Project;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
  status: MilestoneStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
}

export interface TrainingSession {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  provider: string | null;
  startDate: Date;
  endDate: Date;
  maxParticipants: number | null;
  createdAt: Date;
  updatedAt: Date;
  enrollments: TrainingEnrollment[];
}

export interface TrainingEnrollment {
  id: string;
  employeeId: string;
  trainingSessionId: string;
  status: TrainingStatus;
  enrolledAt: Date;
  completedAt: Date | null;
  certificateUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
  trainingSession: TrainingSession;
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
  createdAt: Date;
  updatedAt: Date;
  employee: Employee | null;
  project: Project | null;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  projectId: string | null;
  title: string;
  content: string;
  score: any | null;
  evaluatorId: string | null;
  evaluatorName: string | null;
  evaluationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  employeeId: string | null;
  projectId: string | null;
  userId: string | null;
  metadata: JsonValue | null;
  createdAt: Date;
  employee: Employee | null;
  project: Project | null;
}

export interface Alert {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  isResolved: boolean;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  duration: any;
  description: string | null;
  billable: boolean;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
  project: Project;
}

// ============================================================================
// RELATION AVEC LE SCHÉMA AUTH (référence utilisée par profiles)
// ============================================================================

export interface users {
  id: string;
}
