# Supabase - Configuration et Migrations

## Migration de Prisma vers Supabase direct

Ce dossier contient les scripts SQL pour créer et peupler la base de données Supabase **sans utiliser Prisma**.

## Structure des fichiers

```
supabase/
├── migrations/
│   ├── 001_schema.sql      # Schéma complet (tables, types, index, RLS)
│   └── 002_seed_data.sql   # Données de démonstration
└── README.md               # Ce fichier
```

## Comment appliquer les migrations

### Option 1 : Via le Dashboard Supabase (recommandé)

1. Connectez-vous à votre projet sur [app.supabase.com](https://app.supabase.com)
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le contenu de `001_schema.sql` et exécutez
5. Ensuite, copiez-collez `002_seed_data.sql` et exécutez

### Option 2 : Via Supabase CLI

```bash
# Installer le CLI si nécessaire
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref VOTRE_PROJECT_REF

# Appliquer les migrations
supabase db push
```

### Option 3 : Via psql (ligne de commande PostgreSQL)

```bash
# Récupérez votre connection string depuis le dashboard Supabase
# Settings > Database > Connection string

psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f migrations/001_schema.sql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f migrations/002_seed_data.sql
```

## Liaison avec auth.users

La table `profiles` est automatiquement liée à `auth.users` de Supabase :

- **Clé primaire** : `profiles.id` référence `auth.users.id`
- **Trigger automatique** : Quand un utilisateur s'inscrit via Supabase Auth, un profil est automatiquement créé

```sql
-- Le trigger est déjà inclus dans 001_schema.sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS)

Les politiques RLS sont configurées pour :
- **Lecture** : Accessible à tous les utilisateurs authentifiés
- **Écriture** : Accessible à tous les utilisateurs authentifiés

⚠️ **Important** : Ajustez ces politiques selon vos besoins de sécurité en production.

## Types TypeScript

Les types TypeScript sont disponibles dans `lib/database.ts` pour remplacer les types générés par Prisma.

```typescript
import { Employee, Project, Database } from '@/lib/database';
import { createClient } from '@supabase/supabase-js';

// Client typé
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Utilisation
const { data: employees } = await supabase
  .from('Employee')
  .select('*')
  .eq('status', 'AVAILABLE');
```

## Données de démonstration

Le fichier `002_seed_data.sql` contient des données réalistes pour tester l'application :

- **5 Départements** : Direction Travaux, Bureau d'Études, RH, Logistique, HSE
- **22 Employés** : Directeurs, chefs de chantier, ouvriers, intérimaires...
- **20 Compétences** : Maçonnerie, électricité, plomberie, management...
- **7 Clients** : Mairie, entreprises, hôpitaux...
- **8 Projets** : Résidentiels, commerciaux, médicaux...
- **Affectations, jalons, formations, alertes, etc.**

## Nettoyer et réinitialiser

Pour repartir de zéro (⚠️ attention, supprime toutes les données) :

```sql
-- Dans le SQL Editor de Supabase
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Puis ré-exécutez les migrations
```

## Différences avec Prisma

| Prisma | Supabase Direct |
|--------|-----------------|
| `prisma.employee.findMany()` | `supabase.from('Employee').select()` |
| `prisma.employee.create()` | `supabase.from('Employee').insert()` |
| `prisma.employee.update()` | `supabase.from('Employee').update()` |
| `prisma.employee.delete()` | `supabase.from('Employee').delete()` |
| `include: { department: true }` | `.select('*, Department(*)')` |

## Support

En cas de problème, vérifiez :
1. Que les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien configurées
2. Que les migrations ont été appliquées dans l'ordre (001 avant 002)
3. Les logs dans le dashboard Supabase > Logs



