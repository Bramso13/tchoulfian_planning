# ANALYSE DES DONNÉES UI - TCHOULFIAN PLANNING

## Méthodologie
Analyser toutes les pages et composants UI pour identifier :
1. **STOCKER** : Données qui doivent être en base
2. **CALCULER** : Données dérivées/calculables côté front ou via requêtes

---

## 📊 PAGE : LISTE DES EMPLOYÉS (`/protected/employes`)

### Stats affichées
| Donnée | Type | Stockage |
|--------|------|----------|
| Total employés | COUNT | ❌ CALCULER : `COUNT(*)` sur employees |
| CDI | COUNT | ❌ CALCULER : `COUNT(*) WHERE contract_type = 'CDI'` |
| Intérimaires | COUNT | ❌ CALCULER : `COUNT(*) WHERE contract_type = 'INTERIM'` |
| Formations à faire | COUNT | ❌ CALCULER : `COUNT` assignments type formation à venir |

### EmployeeCard (liste)
| Donnée | Type | Stockage |
|--------|------|----------|
| name | string | ✅ STOCKER : `first_name + last_name` ou depuis Profile.full_name |
| role | string | ✅ STOCKER : `job_title` |
| avatarUrl | string | ✅ STOCKER : Profile.avatar_url |
| contract | string | ✅ STOCKER : `contract_type` (enum) |
| status.label | string | ✅ STOCKER : `status` (enum) |
| status.tone | string | ❌ CALCULER : mapping front basé sur status |
| assignments | string | ❌ CALCULER : "Projet : X" depuis affectation active |
| skills | string[] | ✅ STOCKER : table EmployeeSkill |

---

## 👤 PAGE : DÉTAIL EMPLOYÉ (`/protected/employes/[id]`)

### Informations personnelles
| Donnée | Type | Stockage |
|--------|------|----------|
| name | string | ✅ depuis Profile.full_name |
| role | string | ✅ job_title |
| avatarUrl | string | ✅ Profile.avatar_url |
| status | enum | ✅ employee.status |
| availability | string | ✅ available_from (date) → formatter en front |
| email | string | ✅ employee.email |
| phone | string | ✅ employee.phone |
| address | string | ✅ employee.address / city |
| department | string | ✅ department.name (FK) |
| contract.type | string | ✅ contract_type |
| contract.seniority | string | ❌ CALCULER : depuis hire_date |

### Stats du banner
| Donnée | Type | Stockage |
|--------|------|----------|
| Ancienneté (6 ans) | number | ❌ CALCULER : `NOW() - hire_date` |
| Projets réalisés (14) | number | ❌ CALCULER : `COUNT(assignments WHERE status = COMPLETED)` |
| Satisfaction clients (82%) | number | ❌ CALCULER : `AVG(evaluations.rating)` |

### Affectation actuelle
| Donnée | Type | Stockage |
|--------|------|----------|
| currentProject.name | string | ❌ CALCULER : depuis Assignment active → Project |
| currentProject.since | date | ❌ CALCULER : Assignment.start_date |
| currentProject.role | string | ✅ STOCKER : Assignment.role |
| currentProject.progress | number | ❌ CALCULER : depuis Project.progress (qui est calculé ou mis à jour manuellement) |

### Compétences
| Donnée | Type | Stockage |
|--------|------|----------|
| skills | string[] | ✅ STOCKER : EmployeeSkill → Skill.name |

### Certifications
| Donnée | Type | Stockage |
|--------|------|----------|
| certification.name | string | ✅ STOCKER : EmployeeCertification.name |
| certification.year | number | ✅ STOCKER : EmployeeCertification.issue_date |

### Parcours professionnel (missions)
| Donnée | Type | Stockage |
|--------|------|----------|
| mission.project | string | ❌ CALCULER : Assignment → Project.name |
| mission.period | string | ❌ CALCULER : Assignment start_date → end_date |
| mission.description | string | ✅ STOCKER : Assignment.notes ou description |

### Évaluations/Feedback
| Donnée | Type | Stockage |
|--------|------|----------|
| feedback.title | string | ✅ STOCKER : Evaluation.title |
| feedback.content | string | ✅ STOCKER : Evaluation.content |
| feedback.rating | string | ✅ STOCKER : Evaluation.score (ex: 4.8/5) |

### Documents
| Donnée | Type | Stockage |
|--------|------|----------|
| document.name | string | ✅ STOCKER : Document.name |
| document.updated | date | ✅ STOCKER : Document.updated_at |

---

## 🏗️ PAGE : LISTE DES CHANTIERS (`/protected/chantiers`)

### Stats affichées
| Donnée | Type | Stockage |
|--------|------|----------|
| Projets actifs | COUNT | ❌ CALCULER : `COUNT(*) WHERE status = 'ACTIVE'` |
| En planification | COUNT | ❌ CALCULER : `COUNT(*) WHERE status = 'PLANNING'` |
| En pause | COUNT | ❌ CALCULER : `COUNT(*) WHERE status = 'ON_HOLD'` |
| En retard | COUNT | ❌ CALCULER : `COUNT(*) WHERE status = 'DELAYED'` |
| Terminés ce mois | COUNT | ❌ CALCULER : `COUNT(*) WHERE status = 'COMPLETED' AND completed_at >= début du mois` |

### ProjectCard (liste)
| Donnée | Type | Stockage |
|--------|------|----------|
| name | string | ✅ STOCKER : Project.name |
| type | string | ✅ STOCKER : Project.type |
| location | string | ✅ STOCKER : Project.city |
| duration | string | ❌ CALCULER : `start_date → end_date` formaté |
| teamCount | number | ❌ CALCULER : `COUNT(Assignment WHERE project_id = X AND status = ACTIVE)` |
| status | enum | ✅ STOCKER : Project.status |
| progress | number | ⚠️ **DÉBAT** : Stocker OU calculer depuis milestones ? |
| stage | string | ❌ CALCULER : texte descriptif basé sur progress et dates |
| team (avatars) | array | ❌ CALCULER : depuis Assignments actives |

> **Note progress** : On peut soit :
> - Le STOCKER et permettre mise à jour manuelle
> - Le CALCULER : `(milestones complétés / total milestones) * 100`
> - **RECOMMANDATION** : STOCKER pour flexibilité, mais avec fonction de calcul disponible

---

## 🏢 PAGE : DÉTAIL CHANTIER (`/protected/chantiers/[id]`)

### Informations clés
| Donnée | Type | Stockage |
|--------|------|----------|
| name | string | ✅ STOCKER : Project.name |
| description | string | ✅ STOCKER : Project.description |
| location | string | ✅ STOCKER : Project.address + city |
| client | string | ✅ STOCKER : Client.name (FK) |
| budget | string | ✅ STOCKER : Project.budget_total |
| startDate | date | ✅ STOCKER : Project.start_date |
| endDate | date | ✅ STOCKER : Project.end_date |
| progress | number | ⚠️ comme ci-dessus |

### Stats du banner
| Donnée | Type | Stockage |
|--------|------|----------|
| Avancement global | number | ⚠️ progress (voir ci-dessus) |
| Effectif sur site | number | ❌ CALCULER : COUNT(Assignment actives) |
| Livraison prévue | date | ✅ STOCKER : end_date |

### Jalons/Milestones
| Donnée | Type | Stockage |
|--------|------|----------|
| milestone.title | string | ✅ STOCKER : Milestone.title |
| milestone.date | date | ✅ STOCKER : Milestone.due_date |
| milestone.status | enum | ✅ STOCKER : Milestone.status |

### Documents
| Donnée | Type | Stockage |
|--------|------|----------|
| document.name | string | ✅ STOCKER : Document.name |
| document.updated | date | ✅ STOCKER : Document.updated_at |
| document.category | string | ✅ STOCKER : Document.category |

### Activité récente
| Donnée | Type | Stockage |
|--------|------|----------|
| activity.time | time | ✅ STOCKER : Activity.created_at |
| activity.title | string | ✅ STOCKER : Activity.title |
| activity.description | string | ✅ STOCKER : Activity.description |

### Alertes/Points de vigilance
| Donnée | Type | Stockage |
|--------|------|----------|
| alert.title | string | ✅ STOCKER : Alert.title |
| alert.description | string | ✅ STOCKER : Alert.description |
| alert.severity | string | ✅ STOCKER : Alert.severity |

---

## 📅 PAGE : PLANNING (`/protected/planning`)

### Stats affichées
| Donnée | Type | Stockage |
|--------|------|----------|
| Équipes sur site | COUNT | ❌ CALCULER : COUNT(Assignment TODAY actives) |
| Heures planifiées | SUM | ❌ CALCULER : SUM(Assignment.planned_hours WHERE week = current) |
| Intérimaires | COUNT | ❌ CALCULER : COUNT(Employee WHERE contract = INTERIM AND status = ACTIVE) |
| Alertes | COUNT | ❌ CALCULER : COUNT(Alert WHERE is_resolved = false) |

### Planning journalier (slots)
| Donnée | Type | Stockage |
|--------|------|----------|
| slot.project | string | ❌ CALCULER : Assignment → Project.name |
| slot.time | string | ✅ STOCKER : Assignment.start_time → end_time |
| slot.location | string | ❌ CALCULER : Assignment → Project.city |
| slot.status | enum | ✅ STOCKER : Assignment.status |

### Disponibilité des compétences
| Donnée | Type | Stockage |
|--------|------|----------|
| resource.label | string | ✅ STOCKER : Skill.category (Maçonnerie, etc.) |
| resource.utilization | number | ❌ CALCULER : (employés avec skill en mission / total employés avec skill) * 100 |
| resource.details | string | ❌ CALCULER : noms des équipes |

### Échéances à venir
| Donnée | Type | Stockage |
|--------|------|----------|
| milestone.title | string | ✅ STOCKER : Milestone.title |
| milestone.project | string | ❌ CALCULER : Milestone → Project.name |
| milestone.date | date | ✅ STOCKER : Milestone.due_date |
| milestone.status | enum | ✅ STOCKER : Milestone.status |

---

## 🎯 PAGE : DASHBOARD (`/protected/dashboard`)

### Stats principales
| Donnée | Type | Stockage |
|--------|------|----------|
| Projets actifs | COUNT | ❌ CALCULER : COUNT par status |
| Planification | COUNT | ❌ CALCULER : COUNT par status |
| Projets en pause | COUNT | ❌ CALCULER : COUNT par status |
| Terminés ce mois | COUNT | ❌ CALCULER : COUNT avec filtre date |
| En retard | COUNT | ❌ CALCULER : COUNT par status |

### Pipeline projets
| Donnée | Type | Stockage |
|--------|------|----------|
| project.name | string | ✅ STOCKER |
| project.city | string | ✅ STOCKER |
| project.status | enum | ✅ STOCKER |
| project.progress | number | ⚠️ voir débat plus haut |
| project.team | avatars | ❌ CALCULER : depuis Assignments |

### Vue d'ensemble
| Donnée | Type | Stockage |
|--------|------|----------|
| Taux d'occupation | number | ❌ CALCULER : (employés en mission / total employés) * 100 |
| Satisfaction client | number | ❌ CALCULER : AVG(Evaluation.score) |
| Budget consommé | number | ❌ CALCULER : SUM(dépenses) / total budget OU manuellement mis à jour |

### Activité récente
Même structure que détail chantier

---

## 🎓 FORMATIONS

Comme suggéré par Brahim :
- **Statut employé** : Ajouter `IN_TRAINING` à l'enum EmployeeStatus
- **Affectation formation** : Créer une table `TrainingSession` ou utiliser Assignment avec un flag `is_training`

### Option 1 : Training dans Assignment
```sql
assignments {
  is_training BOOLEAN default false
  training_name STRING? -- si is_training = true
}
```

### Option 2 : Table séparée TrainingSession
```sql
training_sessions {
  id, name, description, start_date, end_date, location
}

training_assignments {
  employee_id, training_session_id, status
}
```

**RECOMMANDATION** : Option 2 est plus scalable pour gérer catalogue de formations, inscriptions multiples, historique, etc.

---

## ✅ RÉSUMÉ : DONNÉES À STOCKER

### Tables principales
1. **Employee** (lié à Profile)
   - profile_id, job_title, contract_type, status, department_id
   - hire_date, termination_date, birth_date
   - email, phone, address, city, postal_code
   - available_from, notes

2. **Project**
   - name, description, type, status
   - address, city, postal_code, coordinates
   - client_id, budget_total
   - start_date, end_date
   - progress (stocké mais calculable)
   - project_manager_id

3. **Assignment**
   - employee_id, project_id
   - role, start_date, end_date
   - start_time, end_time
   - status, planned_hours
   - notes

4. **Skill** (référentiel)
   - name, description, category

5. **EmployeeSkill** (liaison)
   - employee_id, skill_id, level, years_exp

6. **EmployeeCertification**
   - employee_id, name, issuer, cert_number
   - issue_date, expiry_date, document_url

7. **Client**
   - name, contact_name, email, phone, address

8. **Milestone**
   - project_id, title, description
   - due_date, completed_at, status, order

9. **Document**
   - name, description, category, file_url
   - employee_id OR project_id
   - file_size, mime_type

10. **Evaluation**
    - employee_id, project_id (optional)
    - title, content, rating, score
    - evaluator_id, evaluator_name, evaluation_date

11. **Activity** (audit log)
    - type, title, description
    - employee_id, project_id, user_id
    - metadata, created_at

12. **Alert**
    - project_id, title, description, severity
    - is_resolved, resolved_at, resolved_by

13. **TrainingSession** (formations)
    - name, description, location
    - start_date, end_date, max_participants

14. **TrainingEnrollment**
    - employee_id, training_session_id
    - status, enrolled_at, completed_at

15. **Department**
    - name, description, code, manager_id

---

## 📊 DONNÉES À CALCULER (Frontend ou Vues)

### Calculs simples (frontend)
- Ancienneté : `NOW() - hire_date`
- Durée projet : `end_date - start_date`
- Nombre équipe : `COUNT(assignments actives)`
- Formatage dates, textes descriptifs

### Aggregations (requêtes ou vues)
- Taux d'occupation
- Satisfaction moyenne
- Budget consommé (si basé sur time entries)
- Progress (si basé sur milestones)
- Stats par statut (COUNT groupés)

---

## 🔗 LIAISON EMPLOYEE ↔ PROFILE

**Architecture recommandée** :
```
auth.users (Supabase Auth)
    ↓ 1:1
public.profiles (table Supabase de base)
    ↓ 1:0..1
public.employees (nos données métier)
```

**Pourquoi cette structure ?**
- Un user peut exister sans être employé (admin, client, etc.)
- Un employé a forcément un profil/user
- Séparation des préoccupations : auth vs métier
- Profile contient : username, full_name, avatar_url (données communes)
- Employee contient : job_title, contract_type, hire_date, etc. (données RH)

---

## 🚀 FONCTIONNALITÉS FUTURES À ANTICIPER

1. **Time Tracking détaillé**
   - Table `TimeEntry` (employee, project, date, hours, billable)

2. **Gestion des dépenses**
   - Table `Expense` pour calculer budget consommé réellement

3. **Notifications**
   - Table `Notification` (user_id, type, content, read_at)

4. **Commentaires/Notes**
   - Table `Comment` (projet, employé, auteur, content)

5. **Équipements/Matériel**
   - Table `Equipment` (nom, statut, projet assigné)

6. **Sous-traitants**
   - Étendre Employee avec `is_subcontractor` ou table séparée

7. **Gestion des congés**
   - Table `LeaveRequest` (employee, type, start, end, status)

8. **Rapports/Analytics**
   - Vues matérialisées pour performance

9. **Multi-tenant**
   - Ajouter `organization_id` partout si multi-entreprises

10. **Géolocalisation**
    - Coordonnées GPS pour chantiers, itinéraires

---

## ⚡ CONSIDÉRATIONS PERFORMANCE

### Index critiques
- `employees.status, contract_type, department_id`
- `projects.status, type, client_id, start_date, end_date`
- `assignments.employee_id, project_id, start_date, status`
- `activities.created_at DESC` (pour feed)
- `documents.employee_id, project_id, category`
- `milestones.project_id, due_date, status`

### Vues matérialisées recommandées
- `view_employee_stats` (projets, heures, évaluations)
- `view_project_stats` (effectif, budget, alertes)
- `view_resource_utilization` (occupation par compétence)
- `view_upcoming_deadlines` (jalons et formations à venir)

### Soft Delete
- Ajouter `deleted_at` sur Employee, Project
- Permet historique et audit sans perte de données

### Full-text Search
- Activer sur : Employee.name, Project.name, Client.name
- Pour recherche performante

---

FIN DE L'ANALYSE
