-- ============================================================================
-- TCHOULFIAN PLANNING - SCHÉMA DE BASE DE DONNÉES SUPABASE
-- Migration sans Prisma - Liaison directe avec auth.users
-- ============================================================================

-- Supprimer les tables existantes (attention en production!)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ============================================================================
-- ÉNUMÉRATIONS
-- ============================================================================

-- Rôles utilisateurs
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type de contrat
DO $$ BEGIN
  CREATE TYPE "ContractType" AS ENUM (
    'CDI',           -- Contrat à Durée Indéterminée
    'CDD',           -- Contrat à Durée Déterminée
    'INTERIM',       -- Intérimaire
    'FREELANCE',     -- Freelance
    'SUBCONTRACTOR', -- Sous-traitant
    'APPRENTICE'     -- Apprenti
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut employé
DO $$ BEGIN
  CREATE TYPE "EmployeeStatus" AS ENUM (
    'AVAILABLE',     -- Disponible
    'ON_MISSION',    -- En mission
    'IN_TRAINING',   -- En formation
    'ON_LEAVE',      -- En congé
    'SICK_LEAVE',    -- Arrêt maladie
    'ABSENT',        -- Absent
    'TERMINATED'     -- Terminé
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut projet
DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM (
    'DRAFT',         -- Brouillon
    'PLANNING',      -- En planification
    'ACTIVE',        -- En cours
    'ON_HOLD',       -- En pause
    'DELAYED',       -- En retard
    'COMPLETED',     -- Terminé
    'CANCELLED',     -- Annulé
    'ARCHIVED'       -- Archivé
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type de projet
DO $$ BEGIN
  CREATE TYPE "ProjectType" AS ENUM (
    'RESIDENTIAL',    -- Construction résidentielle
    'COMMERCIAL',     -- Construction commerciale
    'INDUSTRIAL',     -- Construction industrielle
    'INFRASTRUCTURE', -- Infrastructure publique
    'RENOVATION',     -- Rénovation
    'MEDICAL',        -- Construction médicale
    'OTHER'           -- Autre
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut d'affectation
DO $$ BEGIN
  CREATE TYPE "AssignmentStatus" AS ENUM (
    'SCHEDULED',     -- Planifié
    'CONFIRMED',     -- Confirmé
    'IN_PROGRESS',   -- En cours
    'COMPLETED',     -- Terminé
    'DELAYED',       -- En retard
    'CANCELLED'      -- Annulé
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut jalon
DO $$ BEGIN
  CREATE TYPE "MilestoneStatus" AS ENUM (
    'PENDING',       -- À venir
    'IN_PROGRESS',   -- En cours
    'COMPLETED',     -- Terminé
    'DELAYED',       -- En retard
    'CANCELLED'      -- Annulé
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Catégorie de document
DO $$ BEGIN
  CREATE TYPE "DocumentCategory" AS ENUM (
    'CONTRACT',      -- Contrat
    'CERTIFICATION', -- Certification
    'RESUME',        -- CV
    'SECURITY',      -- Sécurité
    'PLANNING',      -- Planning
    'FINANCE',       -- Finance
    'TECHNICAL',     -- Technique
    'REPORT',        -- Rapport
    'OTHER'          -- Autre
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Type d'activité
DO $$ BEGIN
  CREATE TYPE "ActivityType" AS ENUM (
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'PROJECT_STATUS_CHANGED',
    'EMPLOYEE_ASSIGNED',
    'EMPLOYEE_UNASSIGNED',
    'MILESTONE_COMPLETED',
    'DOCUMENT_UPLOADED',
    'EVALUATION_ADDED',
    'ALERT_CREATED',
    'ALERT_RESOLVED',
    'COMMENT_ADDED',
    'TRAINING_ENROLLED',
    'TRAINING_COMPLETED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Niveau de compétence
DO $$ BEGIN
  CREATE TYPE "SkillLevel" AS ENUM (
    'BEGINNER',      -- Débutant
    'INTERMEDIATE',  -- Intermédiaire
    'ADVANCED',      -- Avancé
    'EXPERT'         -- Expert
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Statut de formation
DO $$ BEGIN
  CREATE TYPE "TrainingStatus" AS ENUM (
    'ENROLLED',      -- Inscrit
    'IN_PROGRESS',   -- En cours
    'COMPLETED',     -- Terminé
    'CANCELLED',     -- Annulé
    'FAILED'         -- Échoué
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Sévérité d'alerte
DO $$ BEGIN
  CREATE TYPE "AlertSeverity" AS ENUM (
    'LOW',           -- Faible
    'MEDIUM',        -- Moyen
    'HIGH',          -- Élevé
    'CRITICAL'       -- Critique
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES (Extension de auth.users) - LIAISON AVEC SUPABASE AUTH
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role "Role" DEFAULT 'MANAGER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour auto-créer un profil quand un utilisateur s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe avant de le recréer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- DÉPARTEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Department" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  "managerId" UUID,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_department_name ON public."Department"(name);

-- ----------------------------------------------------------------------------
-- EMPLOYÉS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Employee" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Informations professionnelles
  "jobTitle" TEXT NOT NULL,
  "contractType" "ContractType" DEFAULT 'CDI',
  status "EmployeeStatus" DEFAULT 'AVAILABLE',
  "departmentId" UUID REFERENCES public."Department"(id) ON DELETE SET NULL,
  
  -- Contact
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  "postalCode" TEXT,
  "imageUrl" TEXT,
  
  -- Dates
  "hireDate" DATE,
  "terminationDate" DATE,
  "birthDate" DATE,
  
  -- Disponibilité
  "availableFrom" DATE,
  notes TEXT,
  
  -- Métadonnées
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_employee_profile ON public."Employee"("profileId");
CREATE INDEX IF NOT EXISTS idx_employee_email ON public."Employee"(email);
CREATE INDEX IF NOT EXISTS idx_employee_status ON public."Employee"(status);
CREATE INDEX IF NOT EXISTS idx_employee_department ON public."Employee"("departmentId");
CREATE INDEX IF NOT EXISTS idx_employee_contract ON public."Employee"("contractType");
CREATE INDEX IF NOT EXISTS idx_employee_deleted ON public."Employee"("deletedAt");

-- Ajouter la FK pour le manager du département
ALTER TABLE public."Department" 
ADD CONSTRAINT fk_department_manager 
FOREIGN KEY ("managerId") REFERENCES public."Employee"(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- COMPÉTENCES (RÉFÉRENTIEL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Skill" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_name ON public."Skill"(name);
CREATE INDEX IF NOT EXISTS idx_skill_category ON public."Skill"(category);

-- ----------------------------------------------------------------------------
-- COMPÉTENCES DES EMPLOYÉS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."EmployeeSkill" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "skillId" UUID NOT NULL REFERENCES public."Skill"(id) ON DELETE CASCADE,
  level "SkillLevel" DEFAULT 'INTERMEDIATE',
  "yearsExp" INT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("employeeId", "skillId")
);

CREATE INDEX IF NOT EXISTS idx_empskill_employee ON public."EmployeeSkill"("employeeId");
CREATE INDEX IF NOT EXISTS idx_empskill_skill ON public."EmployeeSkill"("skillId");

-- ----------------------------------------------------------------------------
-- CERTIFICATIONS DES EMPLOYÉS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."EmployeeCertification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES public."Employee"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  "certNumber" TEXT,
  "issueDate" DATE,
  "expiryDate" DATE,
  "documentUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empcert_employee ON public."EmployeeCertification"("employeeId");
CREATE INDEX IF NOT EXISTS idx_empcert_expiry ON public."EmployeeCertification"("expiryDate");

-- ----------------------------------------------------------------------------
-- CLIENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Client" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  "contactName" TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  "postalCode" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_name ON public."Client"(name);

-- ----------------------------------------------------------------------------
-- PROJETS / CHANTIERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Project" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations générales
  name TEXT NOT NULL,
  description TEXT,
  type "ProjectType" DEFAULT 'OTHER',
  status "ProjectStatus" DEFAULT 'DRAFT',
  
  -- Localisation
  address TEXT,
  city TEXT,
  "postalCode" TEXT,
  coordinates TEXT,
  
  -- Client
  "clientId" UUID REFERENCES public."Client"(id) ON DELETE SET NULL,
  
  -- Budget
  "budgetTotal" DECIMAL(15, 2),
  "budgetConsumed" DECIMAL(15, 2) DEFAULT 0,
  
  -- Dates
  "startDate" DATE,
  "endDate" DATE,
  "actualEndDate" DATE,
  
  -- Progression
  progress INT DEFAULT 0,
  
  -- Responsable
  "projectManagerId" UUID REFERENCES public."Employee"(id) ON DELETE SET NULL,
  
  -- Métadonnées
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_name ON public."Project"(name);
CREATE INDEX IF NOT EXISTS idx_project_status ON public."Project"(status);
CREATE INDEX IF NOT EXISTS idx_project_type ON public."Project"(type);
CREATE INDEX IF NOT EXISTS idx_project_client ON public."Project"("clientId");
CREATE INDEX IF NOT EXISTS idx_project_start ON public."Project"("startDate");
CREATE INDEX IF NOT EXISTS idx_project_end ON public."Project"("endDate");
CREATE INDEX IF NOT EXISTS idx_project_deleted ON public."Project"("deletedAt");

-- ----------------------------------------------------------------------------
-- AFFECTATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Assignment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "projectId" UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  role TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "startTime" TIME,
  "endTime" TIME,
  status "AssignmentStatus" DEFAULT 'SCHEDULED',
  "plannedHours" DECIMAL(8, 2),
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignment_employee ON public."Assignment"("employeeId");
CREATE INDEX IF NOT EXISTS idx_assignment_project ON public."Assignment"("projectId");
CREATE INDEX IF NOT EXISTS idx_assignment_start ON public."Assignment"("startDate");
CREATE INDEX IF NOT EXISTS idx_assignment_end ON public."Assignment"("endDate");
CREATE INDEX IF NOT EXISTS idx_assignment_status ON public."Assignment"(status);

-- ----------------------------------------------------------------------------
-- JALONS / ÉTAPES DE PROJET
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Milestone" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "dueDate" DATE,
  "completedAt" TIMESTAMPTZ,
  status "MilestoneStatus" DEFAULT 'PENDING',
  "order" INT DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_project ON public."Milestone"("projectId");
CREATE INDEX IF NOT EXISTS idx_milestone_due ON public."Milestone"("dueDate");
CREATE INDEX IF NOT EXISTS idx_milestone_status ON public."Milestone"(status);

-- ----------------------------------------------------------------------------
-- SESSIONS DE FORMATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."TrainingSession" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  provider TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "maxParticipants" INT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_start ON public."TrainingSession"("startDate");
CREATE INDEX IF NOT EXISTS idx_training_end ON public."TrainingSession"("endDate");

-- ----------------------------------------------------------------------------
-- INSCRIPTIONS AUX FORMATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."TrainingEnrollment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "trainingSessionId" UUID NOT NULL REFERENCES public."TrainingSession"(id) ON DELETE CASCADE,
  status "TrainingStatus" DEFAULT 'ENROLLED',
  "enrolledAt" TIMESTAMPTZ DEFAULT NOW(),
  "completedAt" TIMESTAMPTZ,
  "certificateUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("employeeId", "trainingSessionId")
);

CREATE INDEX IF NOT EXISTS idx_enrollment_employee ON public."TrainingEnrollment"("employeeId");
CREATE INDEX IF NOT EXISTS idx_enrollment_session ON public."TrainingEnrollment"("trainingSessionId");
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON public."TrainingEnrollment"(status);

-- ----------------------------------------------------------------------------
-- DOCUMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Document" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category "DocumentCategory" DEFAULT 'OTHER',
  "fileUrl" TEXT NOT NULL,
  "fileSize" INT,
  "mimeType" TEXT,
  "employeeId" UUID REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "projectId" UUID REFERENCES public."Project"(id) ON DELETE CASCADE,
  "uploadedBy" UUID,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_employee ON public."Document"("employeeId");
CREATE INDEX IF NOT EXISTS idx_document_project ON public."Document"("projectId");
CREATE INDEX IF NOT EXISTS idx_document_category ON public."Document"(category);

-- ----------------------------------------------------------------------------
-- ÉVALUATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Evaluation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "projectId" UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  score DECIMAL(3, 2),
  "evaluatorId" UUID,
  "evaluatorName" TEXT,
  "evaluationDate" DATE DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_employee ON public."Evaluation"("employeeId");
CREATE INDEX IF NOT EXISTS idx_evaluation_project ON public."Evaluation"("projectId");
CREATE INDEX IF NOT EXISTS idx_evaluation_date ON public."Evaluation"("evaluationDate");

-- ----------------------------------------------------------------------------
-- ACTIVITÉS / JOURNAL D'AUDIT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Activity" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type "ActivityType" NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "employeeId" UUID REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "projectId" UUID REFERENCES public."Project"(id) ON DELETE CASCADE,
  "userId" UUID,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_employee ON public."Activity"("employeeId");
CREATE INDEX IF NOT EXISTS idx_activity_project ON public."Activity"("projectId");
CREATE INDEX IF NOT EXISTS idx_activity_type ON public."Activity"(type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public."Activity"("createdAt" DESC);

-- ----------------------------------------------------------------------------
-- ALERTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."Alert" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity "AlertSeverity" DEFAULT 'MEDIUM',
  "isResolved" BOOLEAN DEFAULT FALSE,
  "resolvedAt" TIMESTAMPTZ,
  "resolvedBy" UUID,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_project ON public."Alert"("projectId");
CREATE INDEX IF NOT EXISTS idx_alert_resolved ON public."Alert"("isResolved");
CREATE INDEX IF NOT EXISTS idx_alert_severity ON public."Alert"(severity);

-- ----------------------------------------------------------------------------
-- SUIVI DU TEMPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."TimeEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID NOT NULL REFERENCES public."Employee"(id) ON DELETE CASCADE,
  "projectId" UUID NOT NULL REFERENCES public."Project"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  "startTime" TIME,
  "endTime" TIME,
  duration DECIMAL(8, 2) NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeentry_employee ON public."TimeEntry"("employeeId");
CREATE INDEX IF NOT EXISTS idx_timeentry_project ON public."TimeEntry"("projectId");
CREATE INDEX IF NOT EXISTS idx_timeentry_date ON public."TimeEntry"(date);

-- ============================================================================
-- TRIGGERS POUR UPDATED_AT AUTOMATIQUE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour chaque table (créés individuellement pour éviter les problèmes de syntaxe)
DROP TRIGGER IF EXISTS update_Department_updated_at ON public."Department";
CREATE TRIGGER update_Department_updated_at
  BEFORE UPDATE ON public."Department"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Employee_updated_at ON public."Employee";
CREATE TRIGGER update_Employee_updated_at
  BEFORE UPDATE ON public."Employee"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Skill_updated_at ON public."Skill";
CREATE TRIGGER update_Skill_updated_at
  BEFORE UPDATE ON public."Skill"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_EmployeeSkill_updated_at ON public."EmployeeSkill";
CREATE TRIGGER update_EmployeeSkill_updated_at
  BEFORE UPDATE ON public."EmployeeSkill"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_EmployeeCertification_updated_at ON public."EmployeeCertification";
CREATE TRIGGER update_EmployeeCertification_updated_at
  BEFORE UPDATE ON public."EmployeeCertification"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Client_updated_at ON public."Client";
CREATE TRIGGER update_Client_updated_at
  BEFORE UPDATE ON public."Client"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Project_updated_at ON public."Project";
CREATE TRIGGER update_Project_updated_at
  BEFORE UPDATE ON public."Project"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Assignment_updated_at ON public."Assignment";
CREATE TRIGGER update_Assignment_updated_at
  BEFORE UPDATE ON public."Assignment"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Milestone_updated_at ON public."Milestone";
CREATE TRIGGER update_Milestone_updated_at
  BEFORE UPDATE ON public."Milestone"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_TrainingSession_updated_at ON public."TrainingSession";
CREATE TRIGGER update_TrainingSession_updated_at
  BEFORE UPDATE ON public."TrainingSession"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_TrainingEnrollment_updated_at ON public."TrainingEnrollment";
CREATE TRIGGER update_TrainingEnrollment_updated_at
  BEFORE UPDATE ON public."TrainingEnrollment"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Document_updated_at ON public."Document";
CREATE TRIGGER update_Document_updated_at
  BEFORE UPDATE ON public."Document"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Evaluation_updated_at ON public."Evaluation";
CREATE TRIGGER update_Evaluation_updated_at
  BEFORE UPDATE ON public."Evaluation"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_Alert_updated_at ON public."Alert";
CREATE TRIGGER update_Alert_updated_at
  BEFORE UPDATE ON public."Alert"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_TimeEntry_updated_at ON public."TimeEntry";
CREATE TRIGGER update_TimeEntry_updated_at
  BEFORE UPDATE ON public."TimeEntry"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger spécial pour profiles avec updated_at en minuscules
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent voir tous les profils
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Politique: les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Activer RLS sur les autres tables (lecture publique pour l'app)
ALTER TABLE public."Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmployeeSkill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmployeeCertification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrainingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TrainingEnrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Evaluation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TimeEntry" ENABLE ROW LEVEL SECURITY;

-- Politiques de base: lecture pour utilisateurs authentifiés
CREATE POLICY "Allow read for authenticated" ON public."Department" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Employee" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Skill" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."EmployeeSkill" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."EmployeeCertification" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Client" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Project" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Assignment" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Milestone" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."TrainingSession" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."TrainingEnrollment" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Document" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Evaluation" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Activity" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."Alert" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for authenticated" ON public."TimeEntry" FOR SELECT TO authenticated USING (true);

-- Politiques: écriture pour utilisateurs authentifiés (ajuster selon vos besoins)
CREATE POLICY "Allow all for authenticated" ON public."Department" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Employee" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Skill" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."EmployeeSkill" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."EmployeeCertification" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Client" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Project" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Assignment" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Milestone" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."TrainingSession" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."TrainingEnrollment" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Document" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Evaluation" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Activity" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."Alert" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public."TimeEntry" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================

