-- Ajouter le champ isLocked à la table Assignment
ALTER TABLE public."Assignment" 
ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN DEFAULT false;

-- Créer un index pour améliorer les performances des requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_assignment_is_locked ON public."Assignment"("isLocked");

-- Commentaire pour documenter le champ
COMMENT ON COLUMN public."Assignment"."isLocked" IS 'Indique si l''employé est verrouillé sur ce projet et ne doit pas apparaître dans le personnel planifiable';

