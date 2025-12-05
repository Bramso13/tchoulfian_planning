-- ============================================================================
-- TCHOULFIAN PLANNING - DONNÉES DE DÉMONSTRATION
-- Exécuter après 001_schema.sql
-- ============================================================================

-- ============================================================================
-- DÉPARTEMENTS
-- ============================================================================
INSERT INTO public."Department" (id, name, description, code) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Direction Travaux', 'Gestion et supervision des chantiers', 'DT'),
  ('d1000000-0000-0000-0000-000000000002', 'Bureau d''Études', 'Conception et études techniques', 'BE'),
  ('d1000000-0000-0000-0000-000000000003', 'Ressources Humaines', 'Gestion du personnel', 'RH'),
  ('d1000000-0000-0000-0000-000000000004', 'Logistique', 'Approvisionnement et matériel', 'LOG'),
  ('d1000000-0000-0000-0000-000000000005', 'Sécurité', 'Hygiène, sécurité et environnement', 'HSE')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMPÉTENCES (RÉFÉRENTIEL)
-- ============================================================================
INSERT INTO public."Skill" (id, name, description, category) VALUES
  -- Maçonnerie
  ('s1000000-0000-0000-0000-000000000001', 'Maçonnerie traditionnelle', 'Construction en briques, parpaings, pierres', 'Maçonnerie'),
  ('s1000000-0000-0000-0000-000000000002', 'Coffrage', 'Réalisation de coffrages béton', 'Maçonnerie'),
  ('s1000000-0000-0000-0000-000000000003', 'Ferraillage', 'Pose et assemblage d''armatures', 'Maçonnerie'),
  
  -- Électricité
  ('s1000000-0000-0000-0000-000000000004', 'Électricité bâtiment', 'Installations électriques résidentielles/tertiaires', 'Électricité'),
  ('s1000000-0000-0000-0000-000000000005', 'Électricité industrielle', 'Installations électriques industrielles', 'Électricité'),
  ('s1000000-0000-0000-0000-000000000006', 'Domotique', 'Systèmes de maison intelligente', 'Électricité'),
  
  -- Plomberie
  ('s1000000-0000-0000-0000-000000000007', 'Plomberie sanitaire', 'Installations sanitaires', 'Plomberie'),
  ('s1000000-0000-0000-0000-000000000008', 'Chauffage', 'Systèmes de chauffage', 'Plomberie'),
  ('s1000000-0000-0000-0000-000000000009', 'Climatisation', 'Systèmes de climatisation et ventilation', 'Plomberie'),
  
  -- Gros œuvre
  ('s1000000-0000-0000-0000-000000000010', 'Terrassement', 'Travaux de terrassement et excavation', 'Gros œuvre'),
  ('s1000000-0000-0000-0000-000000000011', 'Charpente', 'Construction de charpentes bois/métal', 'Gros œuvre'),
  ('s1000000-0000-0000-0000-000000000012', 'Couverture', 'Travaux de toiture', 'Gros œuvre'),
  
  -- Second œuvre
  ('s1000000-0000-0000-0000-000000000013', 'Plâtrerie', 'Cloisons et plafonds en plâtre', 'Second œuvre'),
  ('s1000000-0000-0000-0000-000000000014', 'Carrelage', 'Pose de carrelage et faïence', 'Second œuvre'),
  ('s1000000-0000-0000-0000-000000000015', 'Peinture', 'Travaux de peinture intérieure/extérieure', 'Second œuvre'),
  ('s1000000-0000-0000-0000-000000000016', 'Menuiserie', 'Installation de menuiseries', 'Second œuvre'),
  
  -- Management
  ('s1000000-0000-0000-0000-000000000017', 'Gestion de chantier', 'Pilotage et coordination de chantier', 'Management'),
  ('s1000000-0000-0000-0000-000000000018', 'Lecture de plans', 'Interprétation de plans techniques', 'Management'),
  ('s1000000-0000-0000-0000-000000000019', 'Coordination SPS', 'Coordination sécurité et protection santé', 'Management'),
  ('s1000000-0000-0000-0000-000000000020', 'Conduite d''engins', 'Conduite d''engins de chantier', 'Engins')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CLIENTS
-- ============================================================================
INSERT INTO public."Client" (id, name, "contactName", email, phone, address, city, "postalCode") VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Mairie de Lyon', 'Jean Dupont', 'j.dupont@mairie-lyon.fr', '04 72 10 30 30', '1 Place de la Comédie', 'Lyon', '69001'),
  ('c1000000-0000-0000-0000-000000000002', 'Groupe Vinci Construction', 'Marie Martin', 'm.martin@vinci.com', '01 47 16 35 00', '1 Cours Ferdinand de Lesseps', 'Rueil-Malmaison', '92851'),
  ('c1000000-0000-0000-0000-000000000003', 'Bouygues Immobilier', 'Pierre Bernard', 'p.bernard@bouygues-immo.com', '01 55 38 25 25', '3 Boulevard Gallieni', 'Issy-les-Moulineaux', '92130'),
  ('c1000000-0000-0000-0000-000000000004', 'Hôpital Edouard Herriot', 'Sophie Leroy', 's.leroy@chu-lyon.fr', '04 72 11 73 00', '5 Place d''Arsonval', 'Lyon', '69003'),
  ('c1000000-0000-0000-0000-000000000005', 'Groupe Casino', 'Luc Moreau', 'l.moreau@groupe-casino.fr', '04 77 45 31 31', '1 Esplanade de France', 'Saint-Étienne', '42000'),
  ('c1000000-0000-0000-0000-000000000006', 'SCI Les Terrasses du Rhône', 'François Petit', 'f.petit@sci-terrasses.fr', '04 78 62 15 80', '45 Rue de la République', 'Lyon', '69002'),
  ('c1000000-0000-0000-0000-000000000007', 'Région Auvergne-Rhône-Alpes', 'Claire Durand', 'c.durand@auvergnerhonealpes.fr', '04 26 73 40 00', '1 Esplanade François Mitterrand', 'Lyon', '69002')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- EMPLOYÉS
-- ============================================================================
INSERT INTO public."Employee" (id, "jobTitle", "contractType", status, "departmentId", name, email, phone, address, city, "postalCode", "imageUrl", "hireDate", notes) VALUES
  -- Direction Travaux
  ('e1000000-0000-0000-0000-000000000001', 'Directeur Travaux', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Marc Dubois', 'marc.dubois@tchoulfian.fr', '06 12 34 56 78', '12 Rue des Lilas', 'Lyon', '69003', NULL, '2018-03-15', 'Direction de projets d''envergure'),
  ('e1000000-0000-0000-0000-000000000002', 'Chef de Chantier Senior', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Laurent Mercier', 'laurent.mercier@tchoulfian.fr', '06 23 45 67 89', '8 Avenue Jean Jaurès', 'Villeurbanne', '69100', NULL, '2019-06-01', '15 ans d''expérience'),
  ('e1000000-0000-0000-0000-000000000003', 'Chef de Chantier', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Stéphane Girard', 'stephane.girard@tchoulfian.fr', '06 34 56 78 90', '22 Rue Garibaldi', 'Lyon', '69006', NULL, '2020-01-10', 'Spécialiste rénovation'),
  ('e1000000-0000-0000-0000-000000000004', 'Conducteur de Travaux', 'CDI', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'Thomas Roux', 'thomas.roux@tchoulfian.fr', '06 45 67 89 01', '5 Place Bellecour', 'Lyon', '69002', NULL, '2021-04-20', NULL),
  ('e1000000-0000-0000-0000-000000000005', 'Assistant Chef de Chantier', 'CDI', 'IN_TRAINING', 'd1000000-0000-0000-0000-000000000001', 'Julien Faure', 'julien.faure@tchoulfian.fr', '06 56 78 90 12', '17 Rue de la Part-Dieu', 'Lyon', '69003', NULL, '2023-09-01', 'En formation chef de chantier'),
  
  -- Bureau d'Études
  ('e1000000-0000-0000-0000-000000000006', 'Ingénieur Structure', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000002', 'Catherine Lemoine', 'catherine.lemoine@tchoulfian.fr', '06 67 89 01 23', '3 Rue Pasteur', 'Caluire', '69300', NULL, '2017-11-08', 'Experte béton armé'),
  ('e1000000-0000-0000-0000-000000000007', 'Dessinateur Projeteur', 'CDI', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000002', 'Nicolas Bertrand', 'nicolas.bertrand@tchoulfian.fr', '06 78 90 12 34', '9 Rue de Bonnel', 'Lyon', '69003', NULL, '2020-05-15', 'AutoCAD, Revit'),
  ('e1000000-0000-0000-0000-000000000008', 'Métreur', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000002', 'Émilie Perrin', 'emilie.perrin@tchoulfian.fr', '06 89 01 23 45', '28 Cours Lafayette', 'Lyon', '69003', NULL, '2021-02-01', NULL),
  
  -- Ouvriers
  ('e1000000-0000-0000-0000-000000000009', 'Maçon Qualifié', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Ahmed Benali', 'ahmed.benali@tchoulfian.fr', '06 90 12 34 56', '15 Rue Moncey', 'Lyon', '69003', NULL, '2018-07-20', '20 ans d''expérience'),
  ('e1000000-0000-0000-0000-000000000010', 'Maçon', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Paulo Silva', 'paulo.silva@tchoulfian.fr', '06 01 23 45 67', '42 Avenue Berthelot', 'Lyon', '69007', NULL, '2019-03-01', 'Spécialiste coffreur'),
  ('e1000000-0000-0000-0000-000000000011', 'Électricien', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Jean-Pierre Moreau', 'jp.moreau@tchoulfian.fr', '06 12 34 56 01', '7 Rue Cuvier', 'Villeurbanne', '69100', NULL, '2020-09-15', 'Habilitation BR'),
  ('e1000000-0000-0000-0000-000000000012', 'Plombier Chauffagiste', 'CDI', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000001', 'Karim Hamdi', 'karim.hamdi@tchoulfian.fr', '06 23 45 67 02', '19 Rue de Créqui', 'Lyon', '69003', NULL, '2021-01-10', 'Expert VMC'),
  ('e1000000-0000-0000-0000-000000000013', 'Carreleur', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Giuseppe Rossi', 'giuseppe.rossi@tchoulfian.fr', '06 34 56 78 03', '31 Rue Vendôme', 'Lyon', '69006', NULL, '2019-11-01', 'Mosaïque et grands formats'),
  ('e1000000-0000-0000-0000-000000000014', 'Peintre', 'CDI', 'ON_LEAVE', 'd1000000-0000-0000-0000-000000000001', 'Michel Blanc', 'michel.blanc@tchoulfian.fr', '06 45 67 89 04', '8 Rue de Sèze', 'Lyon', '69006', NULL, '2022-04-01', 'Congés jusqu''au 15/12'),
  ('e1000000-0000-0000-0000-000000000015', 'Menuisier', 'CDD', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Olivier Martin', 'olivier.martin@tchoulfian.fr', '06 56 78 90 05', '25 Rue de la Charité', 'Lyon', '69002', NULL, '2024-01-15', 'CDD 6 mois'),
  
  -- Intérimaires
  ('e1000000-0000-0000-0000-000000000016', 'Manœuvre', 'INTERIM', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Kevin Duval', 'kevin.duval@tchoulfian.fr', '06 67 89 01 06', '4 Rue de la Bourse', 'Lyon', '69002', NULL, '2024-11-01', 'Mission jusqu''au 31/12'),
  ('e1000000-0000-0000-0000-000000000017', 'Aide Maçon', 'INTERIM', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Mamadou Diallo', 'mamadou.diallo@tchoulfian.fr', '06 78 90 12 07', '11 Rue Tronchet', 'Lyon', '69006', NULL, '2024-10-15', 'Mission jusqu''au 20/12'),
  
  -- HSE
  ('e1000000-0000-0000-0000-000000000018', 'Responsable HSE', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000005', 'Nathalie Chevalier', 'nathalie.chevalier@tchoulfian.fr', '06 89 01 23 08', '2 Place des Terreaux', 'Lyon', '69001', NULL, '2016-05-01', 'Coordinatrice SPS niveau 1'),
  ('e1000000-0000-0000-0000-000000000019', 'Chargé Sécurité', 'CDI', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000005', 'David Robert', 'david.robert@tchoulfian.fr', '06 90 12 34 09', '6 Rue du Président Carnot', 'Lyon', '69002', NULL, '2022-08-01', 'SST formateur'),
  
  -- Logistique
  ('e1000000-0000-0000-0000-000000000020', 'Responsable Logistique', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000004', 'Bruno Lefebvre', 'bruno.lefebvre@tchoulfian.fr', '06 01 23 45 10', '14 Quai Rambaud', 'Lyon', '69002', NULL, '2015-09-01', 'Gestion du parc matériel'),
  ('e1000000-0000-0000-0000-000000000021', 'Chauffeur PL', 'CDI', 'AVAILABLE', 'd1000000-0000-0000-0000-000000000004', 'Patrick Simon', 'patrick.simon@tchoulfian.fr', '06 12 34 56 11', '20 Rue du Dauphiné', 'Lyon', '69003', NULL, '2020-03-15', 'Permis C + FIMO'),
  ('e1000000-0000-0000-0000-000000000022', 'Grutier', 'CDI', 'ON_MISSION', 'd1000000-0000-0000-0000-000000000001', 'Yannick Morin', 'yannick.morin@tchoulfian.fr', '06 23 45 67 12', '33 Rue de Marseille', 'Lyon', '69007', NULL, '2018-01-10', 'CACES R487')
ON CONFLICT (id) DO NOTHING;

-- Mise à jour des managers de département
UPDATE public."Department" SET "managerId" = 'e1000000-0000-0000-0000-000000000001' WHERE id = 'd1000000-0000-0000-0000-000000000001';
UPDATE public."Department" SET "managerId" = 'e1000000-0000-0000-0000-000000000006' WHERE id = 'd1000000-0000-0000-0000-000000000002';
UPDATE public."Department" SET "managerId" = 'e1000000-0000-0000-0000-000000000018' WHERE id = 'd1000000-0000-0000-0000-000000000005';
UPDATE public."Department" SET "managerId" = 'e1000000-0000-0000-0000-000000000020' WHERE id = 'd1000000-0000-0000-0000-000000000004';

-- ============================================================================
-- COMPÉTENCES DES EMPLOYÉS
-- ============================================================================
INSERT INTO public."EmployeeSkill" ("employeeId", "skillId", level, "yearsExp") VALUES
  -- Marc Dubois (Directeur)
  ('e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000017', 'EXPERT', 20),
  ('e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000018', 'EXPERT', 20),
  ('e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000019', 'ADVANCED', 15),
  
  -- Laurent Mercier (Chef de Chantier Senior)
  ('e1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000017', 'EXPERT', 15),
  ('e1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000018', 'EXPERT', 15),
  ('e1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'ADVANCED', 10),
  
  -- Ahmed Benali (Maçon Qualifié)
  ('e1000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000001', 'EXPERT', 20),
  ('e1000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000002', 'EXPERT', 18),
  ('e1000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000003', 'ADVANCED', 15),
  
  -- Paulo Silva (Maçon Coffreur)
  ('e1000000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000002', 'EXPERT', 12),
  ('e1000000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000001', 'ADVANCED', 10),
  
  -- Jean-Pierre Moreau (Électricien)
  ('e1000000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000004', 'EXPERT', 15),
  ('e1000000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000006', 'ADVANCED', 8),
  
  -- Karim Hamdi (Plombier)
  ('e1000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000007', 'EXPERT', 12),
  ('e1000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000008', 'ADVANCED', 10),
  ('e1000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000009', 'INTERMEDIATE', 5),
  
  -- Giuseppe Rossi (Carreleur)
  ('e1000000-0000-0000-0000-000000000013', 's1000000-0000-0000-0000-000000000014', 'EXPERT', 20),
  
  -- Michel Blanc (Peintre)
  ('e1000000-0000-0000-0000-000000000014', 's1000000-0000-0000-0000-000000000015', 'EXPERT', 15),
  
  -- Yannick Morin (Grutier)
  ('e1000000-0000-0000-0000-000000000022', 's1000000-0000-0000-0000-000000000020', 'EXPERT', 12)
ON CONFLICT ("employeeId", "skillId") DO NOTHING;

-- ============================================================================
-- CERTIFICATIONS DES EMPLOYÉS
-- ============================================================================
INSERT INTO public."EmployeeCertification" ("employeeId", name, issuer, "certNumber", "issueDate", "expiryDate") VALUES
  -- Nathalie Chevalier (HSE)
  ('e1000000-0000-0000-0000-000000000018', 'Coordination SPS niveau 1', 'OPPBTP', 'SPS-2020-1234', '2020-06-15', '2025-06-15'),
  ('e1000000-0000-0000-0000-000000000018', 'SST - Sauveteur Secouriste du Travail', 'INRS', 'SST-2023-5678', '2023-03-10', '2025-03-10'),
  
  -- David Robert (Sécurité)
  ('e1000000-0000-0000-0000-000000000019', 'SST Formateur', 'INRS', 'SSTF-2022-9012', '2022-09-01', '2025-09-01'),
  
  -- Jean-Pierre Moreau (Électricien)
  ('e1000000-0000-0000-0000-000000000011', 'Habilitation électrique BR', 'APAVE', 'BR-2023-3456', '2023-01-15', '2026-01-15'),
  ('e1000000-0000-0000-0000-000000000011', 'Habilitation électrique B2V', 'APAVE', 'B2V-2023-7890', '2023-01-15', '2026-01-15'),
  
  -- Yannick Morin (Grutier)
  ('e1000000-0000-0000-0000-000000000022', 'CACES R487 Grues à tour', 'AFTRAL', 'R487-2022-1122', '2022-04-20', '2027-04-20'),
  
  -- Patrick Simon (Chauffeur)
  ('e1000000-0000-0000-0000-000000000021', 'FIMO Marchandises', 'AFT', 'FIMO-2020-3344', '2020-08-01', '2025-08-01'),
  ('e1000000-0000-0000-0000-000000000021', 'ADR Base', 'AFT', 'ADR-2022-5566', '2022-03-15', '2027-03-15'),
  
  -- Marc Dubois (Directeur)
  ('e1000000-0000-0000-0000-000000000001', 'Coordination SPS niveau 2', 'OPPBTP', 'SPS2-2019-7788', '2019-05-01', '2024-05-01'),
  
  -- Ahmed Benali (Maçon)
  ('e1000000-0000-0000-0000-000000000009', 'Habilitation Amiante SS4', 'AFPA', 'SS4-2023-9900', '2023-06-01', '2026-06-01')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PROJETS / CHANTIERS
-- ============================================================================
INSERT INTO public."Project" (id, name, description, type, status, address, city, "postalCode", "clientId", "budgetTotal", "budgetConsumed", "startDate", "endDate", progress, "projectManagerId") VALUES
  -- Projets actifs
  ('p1000000-0000-0000-0000-000000000001', 'Résidence Les Balcons du Rhône', 'Construction de 45 logements collectifs avec parking souterrain', 'RESIDENTIAL', 'ACTIVE', '125 Quai Pierre Scize', 'Lyon', '69005', 'c1000000-0000-0000-0000-000000000006', 4500000.00, 2700000.00, '2024-02-01', '2025-08-31', 60, 'e1000000-0000-0000-0000-000000000001'),
  
  ('p1000000-0000-0000-0000-000000000002', 'Extension Hôpital Herriot - Bâtiment B2', 'Extension du service cardiologie avec 30 chambres', 'MEDICAL', 'ACTIVE', '5 Place d''Arsonval', 'Lyon', '69003', 'c1000000-0000-0000-0000-000000000004', 8200000.00, 3280000.00, '2024-03-15', '2025-12-31', 40, 'e1000000-0000-0000-0000-000000000002'),
  
  ('p1000000-0000-0000-0000-000000000003', 'Centre Commercial Confluence Phase 2', 'Aménagement de 15 nouvelles cellules commerciales', 'COMMERCIAL', 'ACTIVE', '112 Cours Charlemagne', 'Lyon', '69002', 'c1000000-0000-0000-0000-000000000003', 3200000.00, 2560000.00, '2024-01-10', '2024-12-20', 80, 'e1000000-0000-0000-0000-000000000003'),
  
  ('p1000000-0000-0000-0000-000000000004', 'Rénovation Lycée Ampère', 'Réhabilitation énergétique et mise aux normes PMR', 'RENOVATION', 'DELAYED', '31 Rue de la Bourse', 'Lyon', '69002', 'c1000000-0000-0000-0000-000000000007', 2100000.00, 945000.00, '2024-06-01', '2025-02-28', 45, 'e1000000-0000-0000-0000-000000000001'),
  
  ('p1000000-0000-0000-0000-000000000005', 'Entrepôt Logistique Saint-Priest', 'Construction d''un entrepôt de 8000m² avec quais', 'INDUSTRIAL', 'ACTIVE', 'ZI Mi-Plaine', 'Saint-Priest', '69800', 'c1000000-0000-0000-0000-000000000005', 5600000.00, 1120000.00, '2024-09-01', '2025-06-30', 20, 'e1000000-0000-0000-0000-000000000002'),
  
  -- Projets en planification
  ('p1000000-0000-0000-0000-000000000006', 'Résidence Seniors Gerland', 'Construction de 60 logements adaptés', 'RESIDENTIAL', 'PLANNING', '15 Avenue Tony Garnier', 'Lyon', '69007', 'c1000000-0000-0000-0000-000000000006', 6800000.00, 0.00, '2025-03-01', '2026-09-30', 0, NULL),
  
  ('p1000000-0000-0000-0000-000000000007', 'Pont Raymond Barre - Réfection', 'Réfection de l''étanchéité et des joints', 'INFRASTRUCTURE', 'PLANNING', 'Pont Raymond Barre', 'Lyon', '69002', 'c1000000-0000-0000-0000-000000000001', 1200000.00, 0.00, '2025-04-01', '2025-10-31', 0, NULL),
  
  -- Projet terminé
  ('p1000000-0000-0000-0000-000000000008', 'Bureaux Tech Hub Part-Dieu', 'Aménagement de 2500m² de bureaux', 'COMMERCIAL', 'COMPLETED', '65 Boulevard Vivier Merle', 'Lyon', '69003', 'c1000000-0000-0000-0000-000000000002', 1800000.00, 1750000.00, '2023-06-01', '2024-06-30', 100, 'e1000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- JALONS
-- ============================================================================
INSERT INTO public."Milestone" ("projectId", title, description, "dueDate", status, "order", "completedAt") VALUES
  -- Résidence Les Balcons du Rhône
  ('p1000000-0000-0000-0000-000000000001', 'Terrassement et fondations', 'Terrassement général et coulage des fondations', '2024-04-30', 'COMPLETED', 1, '2024-04-25 10:00:00+02'),
  ('p1000000-0000-0000-0000-000000000001', 'Gros œuvre RDC et R+1', 'Structure béton des 2 premiers niveaux', '2024-07-31', 'COMPLETED', 2, '2024-08-05 14:30:00+02'),
  ('p1000000-0000-0000-0000-000000000001', 'Gros œuvre R+2 à R+5', 'Structure béton des étages supérieurs', '2024-11-30', 'COMPLETED', 3, '2024-11-28 16:00:00+02'),
  ('p1000000-0000-0000-0000-000000000001', 'Mise hors d''eau / hors d''air', 'Toiture et menuiseries extérieures', '2025-02-28', 'IN_PROGRESS', 4, NULL),
  ('p1000000-0000-0000-0000-000000000001', 'Second œuvre', 'Cloisons, électricité, plomberie, carrelage', '2025-06-30', 'PENDING', 5, NULL),
  ('p1000000-0000-0000-0000-000000000001', 'Finitions et livraison', 'Peinture, nettoyage, livraison', '2025-08-31', 'PENDING', 6, NULL),
  
  -- Extension Hôpital
  ('p1000000-0000-0000-0000-000000000002', 'Préparation du site', 'Démolition annexe existante et préparation', '2024-05-15', 'COMPLETED', 1, '2024-05-10 09:00:00+02'),
  ('p1000000-0000-0000-0000-000000000002', 'Fondations spéciales', 'Micropieux et radier', '2024-08-31', 'COMPLETED', 2, '2024-09-05 11:00:00+02'),
  ('p1000000-0000-0000-0000-000000000002', 'Structure béton', 'Gros œuvre tous niveaux', '2025-03-31', 'IN_PROGRESS', 3, NULL),
  ('p1000000-0000-0000-0000-000000000002', 'Façades et couverture', 'Enveloppe du bâtiment', '2025-06-30', 'PENDING', 4, NULL),
  ('p1000000-0000-0000-0000-000000000002', 'Équipements techniques', 'HVAC, fluides médicaux, électricité', '2025-10-31', 'PENDING', 5, NULL),
  ('p1000000-0000-0000-0000-000000000002', 'Aménagements intérieurs', 'Cloisons, sols, plafonds', '2025-12-15', 'PENDING', 6, NULL),
  
  -- Centre Commercial Confluence
  ('p1000000-0000-0000-0000-000000000003', 'Dépose et démolition', 'Dépose des anciens aménagements', '2024-02-28', 'COMPLETED', 1, '2024-02-25 17:00:00+01'),
  ('p1000000-0000-0000-0000-000000000003', 'Réseaux techniques', 'Refonte des réseaux électriques et fluides', '2024-05-31', 'COMPLETED', 2, '2024-05-28 15:00:00+02'),
  ('p1000000-0000-0000-0000-000000000003', 'Cloisonnement cellules', 'Division des espaces commerciaux', '2024-08-31', 'COMPLETED', 3, '2024-08-30 12:00:00+02'),
  ('p1000000-0000-0000-0000-000000000003', 'Finitions parties communes', 'Sols, plafonds, éclairage', '2024-11-30', 'IN_PROGRESS', 4, NULL),
  ('p1000000-0000-0000-0000-000000000003', 'Livraison aux enseignes', 'Remise des clés aux locataires', '2024-12-20', 'PENDING', 5, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AFFECTATIONS
-- ============================================================================
INSERT INTO public."Assignment" ("employeeId", "projectId", role, "startDate", "endDate", status, "plannedHours", notes) VALUES
  -- Résidence Les Balcons du Rhône
  ('e1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Direction de projet', '2024-02-01', '2025-08-31', 'IN_PROGRESS', 800, 'Supervision globale'),
  ('e1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'Chef de chantier principal', '2024-02-01', '2025-08-31', 'IN_PROGRESS', 2000, NULL),
  ('e1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000001', 'Maçonnerie gros œuvre', '2024-03-01', '2025-02-28', 'IN_PROGRESS', 1600, NULL),
  ('e1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000001', 'Coffrage', '2024-03-01', '2025-01-31', 'IN_PROGRESS', 1400, NULL),
  ('e1000000-0000-0000-0000-000000000022', 'p1000000-0000-0000-0000-000000000001', 'Grutage', '2024-03-15', '2025-03-31', 'IN_PROGRESS', 1200, NULL),
  ('e1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000001', 'Coordination SPS', '2024-02-01', '2025-08-31', 'IN_PROGRESS', 400, 'Visites hebdomadaires'),
  
  -- Extension Hôpital
  ('e1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 'Chef de chantier', '2024-03-15', '2025-12-31', 'IN_PROGRESS', 2200, NULL),
  ('e1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000002', 'Suivi structure', '2024-03-15', '2025-06-30', 'IN_PROGRESS', 600, 'Études et suivi'),
  ('e1000000-0000-0000-0000-000000000016', 'p1000000-0000-0000-0000-000000000002', 'Manutention', '2024-11-01', '2024-12-31', 'IN_PROGRESS', 350, NULL),
  ('e1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000002', 'Aide maçon', '2024-10-15', '2024-12-20', 'IN_PROGRESS', 400, NULL),
  
  -- Centre Commercial Confluence
  ('e1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 'Chef de chantier', '2024-01-10', '2024-12-20', 'IN_PROGRESS', 1800, NULL),
  ('e1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000003', 'Électricité', '2024-03-01', '2024-11-30', 'IN_PROGRESS', 1200, NULL),
  ('e1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000003', 'Carrelage', '2024-09-01', '2024-12-15', 'IN_PROGRESS', 600, NULL),
  ('e1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000003', 'Menuiserie', '2024-10-01', '2024-12-10', 'IN_PROGRESS', 450, NULL),
  
  -- Rénovation Lycée Ampère
  ('e1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000004', 'Direction de projet', '2024-06-01', '2025-02-28', 'IN_PROGRESS', 300, NULL),
  ('e1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 'Conducteur de travaux', '2024-06-01', '2025-02-28', 'SCHEDULED', 600, 'À démarrer en janvier'),
  
  -- Entrepôt Saint-Priest
  ('e1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000005', 'Chef de chantier', '2024-09-01', '2025-06-30', 'IN_PROGRESS', 1600, NULL),
  ('e1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000005', 'Métré et suivi', '2024-09-01', '2025-06-30', 'IN_PROGRESS', 400, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SESSIONS DE FORMATION
-- ============================================================================
INSERT INTO public."TrainingSession" (id, name, description, location, provider, "startDate", "endDate", "maxParticipants") VALUES
  ('t1000000-0000-0000-0000-000000000001', 'Habilitation électrique B1V-BR', 'Formation initiale habilitation électrique', 'Centre APAVE Lyon', 'APAVE', '2024-12-16', '2024-12-18', 12),
  ('t1000000-0000-0000-0000-000000000002', 'CACES R489 - Chariots élévateurs', 'Conduite de chariots élévateurs catégories 1, 3 et 5', 'Centre AFTRAL Vénissieux', 'AFTRAL', '2025-01-13', '2025-01-17', 8),
  ('t1000000-0000-0000-0000-000000000003', 'SST - Formation initiale', 'Sauveteur Secouriste du Travail', 'Locaux entreprise', 'INRS partenaire', '2025-01-20', '2025-01-21', 10),
  ('t1000000-0000-0000-0000-000000000004', 'Chef de chantier niveau 2', 'Perfectionnement gestion de chantier', 'ESTP Lyon', 'ESTP', '2025-02-03', '2025-02-07', 15),
  ('t1000000-0000-0000-0000-000000000005', 'Travail en hauteur', 'Port du harnais et travail sur échafaudage', 'Centre OPPBTP', 'OPPBTP', '2025-01-27', '2025-01-28', 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INSCRIPTIONS AUX FORMATIONS
-- ============================================================================
INSERT INTO public."TrainingEnrollment" ("employeeId", "trainingSessionId", status) VALUES
  ('e1000000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000004', 'ENROLLED'),
  ('e1000000-0000-0000-0000-000000000016', 't1000000-0000-0000-0000-000000000003', 'ENROLLED'),
  ('e1000000-0000-0000-0000-000000000017', 't1000000-0000-0000-0000-000000000003', 'ENROLLED'),
  ('e1000000-0000-0000-0000-000000000017', 't1000000-0000-0000-0000-000000000005', 'ENROLLED'),
  ('e1000000-0000-0000-0000-000000000010', 't1000000-0000-0000-0000-000000000005', 'ENROLLED')
ON CONFLICT ("employeeId", "trainingSessionId") DO NOTHING;

-- ============================================================================
-- ALERTES
-- ============================================================================
INSERT INTO public."Alert" ("projectId", title, description, severity, "isResolved") VALUES
  ('p1000000-0000-0000-0000-000000000004', 'Retard approvisionnement menuiseries', 'Délai de livraison des menuiseries aluminium repoussé de 3 semaines', 'HIGH', false),
  ('p1000000-0000-0000-0000-000000000004', 'Découverte amiante', 'Amiante détecté dans les joints de fenêtres existantes - désamiantage requis', 'CRITICAL', false),
  ('p1000000-0000-0000-0000-000000000001', 'Conditions météo', 'Prévisions de gel - suspension coulage béton', 'MEDIUM', true),
  ('p1000000-0000-0000-0000-000000000002', 'Coordination réseaux', 'Interférence avec réseau eau potable existant', 'MEDIUM', false),
  ('p1000000-0000-0000-0000-000000000003', 'Finition carrelage', 'Retard dans la réception des carreaux grand format', 'LOW', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ACTIVITÉS RÉCENTES
-- ============================================================================
INSERT INTO public."Activity" (type, title, description, "employeeId", "projectId", "createdAt") VALUES
  ('MILESTONE_COMPLETED', 'Jalon terminé', 'Gros œuvre R+2 à R+5 terminé', NULL, 'p1000000-0000-0000-0000-000000000001', '2024-11-28 16:00:00+01'),
  ('EMPLOYEE_ASSIGNED', 'Nouvelle affectation', 'Olivier Martin affecté au Centre Commercial Confluence', 'e1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000003', '2024-10-01 09:00:00+02'),
  ('ALERT_CREATED', 'Nouvelle alerte', 'Découverte amiante sur le chantier Lycée Ampère', NULL, 'p1000000-0000-0000-0000-000000000004', '2024-11-15 14:30:00+01'),
  ('PROJECT_STATUS_CHANGED', 'Changement de statut', 'Projet Lycée Ampère passé en statut "En retard"', NULL, 'p1000000-0000-0000-0000-000000000004', '2024-11-20 10:00:00+01'),
  ('TRAINING_ENROLLED', 'Inscription formation', 'Julien Faure inscrit à la formation Chef de chantier niveau 2', 'e1000000-0000-0000-0000-000000000005', NULL, '2024-11-25 11:00:00+01'),
  ('DOCUMENT_UPLOADED', 'Document ajouté', 'Plan d''exécution niveau R+4 téléversé', NULL, 'p1000000-0000-0000-0000-000000000001', '2024-12-01 15:30:00+01'),
  ('EVALUATION_ADDED', 'Évaluation ajoutée', 'Évaluation annuelle Ahmed Benali', 'e1000000-0000-0000-0000-000000000009', NULL, '2024-12-02 09:00:00+01')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ÉVALUATIONS
-- ============================================================================
INSERT INTO public."Evaluation" ("employeeId", "projectId", title, content, score, "evaluatorName", "evaluationDate") VALUES
  ('e1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000001', 'Évaluation annuelle 2024', 'Excellent travail sur le chantier Balcons du Rhône. Maîtrise technique parfaite, respect des délais, bon encadrement des équipes.', 4.80, 'Laurent Mercier', '2024-12-02'),
  ('e1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000001', 'Évaluation mi-parcours', 'Très bon coffreur, travail propre et efficace. À former sur la lecture de plans.', 4.20, 'Laurent Mercier', '2024-09-15'),
  ('e1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000003', 'Évaluation projet Confluence', 'Installation électrique conforme, bon relationnel avec les autres corps de métier.', 4.50, 'Stéphane Girard', '2024-11-20')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ENTRÉES DE TEMPS (dernière semaine)
-- ============================================================================
INSERT INTO public."TimeEntry" ("employeeId", "projectId", date, duration, description, billable) VALUES
  -- Semaine du 2 décembre 2024
  ('e1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '2024-12-02', 8.0, 'Supervision coulage dalle R+5', true),
  ('e1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '2024-12-03', 8.0, 'Coordination équipes gros œuvre', true),
  ('e1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '2024-12-04', 8.0, 'Réunion de chantier + suivi', true),
  ('e1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000001', '2024-12-02', 8.0, 'Maçonnerie murs R+5', true),
  ('e1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000001', '2024-12-03', 8.0, 'Maçonnerie murs R+5', true),
  ('e1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000001', '2024-12-04', 8.0, 'Maçonnerie murs R+5', true),
  ('e1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', '2024-12-02', 8.0, 'Coordination finitions', true),
  ('e1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', '2024-12-03', 8.0, 'Suivi carrelage cellules 8-12', true),
  ('e1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', '2024-12-04', 8.0, 'Réception menuiseries', true),
  ('e1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000003', '2024-12-02', 8.0, 'Pose carrelage cellule 10', true),
  ('e1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000003', '2024-12-03', 8.0, 'Pose carrelage cellule 10', true),
  ('e1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000003', '2024-12-04', 8.0, 'Pose carrelage cellule 11', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DES DONNÉES DE DÉMONSTRATION
-- ============================================================================


