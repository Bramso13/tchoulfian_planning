📝 PRD — TCHOULFIAN PLANNING
1. Contexte général

TCHOULFIAN Planning est une application SaaS pour la gestion de projets de construction (chantiers) et des ressources humaines, permettant :

Planification et affectation des équipes

Suivi des projets, budgets et jalons

Gestion des compétences et certifications des employés

Gestion des formations et des alertes

Objectif principal : optimiser la planification et la visibilité sur les projets tout en respectant les contraintes de disponibilité et de compétences.

2. Personas / Utilisateurs

Admin

Gestion globale des projets et employés

Accès complet aux dashboards et données

Peut affecter les employés, suivre budgets, jalons, alertes

Manager

Gestion partielle des chantiers et employés

Peut créer/affecter missions, suivre progrès

Employé

Visualisation de ses missions, planning et formations

Gestion de ses compétences et certifications

3. Objectifs business

Optimiser la planification pour réduire les conflits d’affectation

Fournir une visibilité en temps réel sur projets et équipes

Assurer traçabilité complète des activités

Suivre et exploiter les compétences et certifications

Réduire les coûts en évitant les surcharges

4. User Stories (exemples)

US-ADMIN-001 : En tant qu’admin, je veux voir le nombre total d’utilisateurs pour avoir une vue d’ensemble.

US-ADMIN-002 : En tant qu’admin, je veux voir la liste des dossiers/chantiers pour suivre leur statut.

US-ADMIN-003 : En tant qu’admin, je veux cliquer sur un dossier pour voir son détail.

US-CLIENT-001 : En tant qu’employé, je veux voir mon planning pour gérer mes missions.

US-CLIENT-002 : En tant qu’employé, je veux voir mes formations et inscriptions.

5. Exigences fonctionnelles
Dashboard

Statistiques globales : nombre de projets par statut, taux d’occupation, budget consommé

Pipeline projets

Activité récente

Priorités et alertes

Gestion des chantiers

Liste et détail des projets

Jalons et progression

Équipe affectée et documents associés

Gestion des employés

Liste et profil employé

Affectations et compétences

Certifications et évaluations

Planning

Vue semaine/mois/Gantt

Drag & drop des affectations

Vérification conflits et alertes

Statistiques sur les ressources

Formations

Gestion des sessions

Inscriptions et suivi

Émissions de certificats

6. Exigences non-fonctionnelles

Performance : chargement rapide et réactivité

Sécurité : RLS, auth Supabase

Compatibilité : navigateurs modernes, responsive

UI/UX : shadcn/ui, Tailwind, dark/light mode

Testabilité : mock data, seed data disponible

7. Priorités

Authentification et accès protégé

Dashboard Admin & Client

Gestion chantiers et employés

Planning et drag & drop

Formations

Statistiques avancées, notifications, exports

8. Métriques de succès

Réduction des conflits d’affectation

Temps moyen pour planifier un projet

Satisfaction des utilisateurs internes

Respect des budgets et délais

9. Contraintes techniques

Next.js App Router + TypeScript

Tailwind CSS, shadcn/ui, lucide-react

Supabase (PostgreSQL, Auth, Storage)

Pas d’ORM, SQL direct

Déploiement Vercel

Composants Server par défaut, Client seulement si nécessaire

10. Données de test

Départements

Employés avec profils

Projets/chantiers

Affectations

Compétences et certifications

Clients

Jalons et sessions de formation