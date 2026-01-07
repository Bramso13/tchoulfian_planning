# 🔧 Configuration des Variables d'Environnement

## Problème : "Invalid API key"

Cette erreur signifie que les clés API Supabase ne sont pas configurées dans votre projet.

## Solution : Configurer les variables d'environnement

### Étape 1 : Créer le fichier `.env.local`

À la racine du projet, créez un fichier nommé `.env.local` (s'il n'existe pas déjà).

### Étape 2 : Obtenir vos clés Supabase

1. **Connectez-vous à Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** (ou créez-en un nouveau si nécessaire)
3. **Allez dans Settings > API** (ou Paramètres > API)
4. **Copiez les valeurs suivantes** :
   - **Project URL** : L'URL de votre projet (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon key** ou **publishable key** : La clé publique (commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Étape 3 : Remplir le fichier `.env.local`

Ouvrez le fichier `.env.local` et ajoutez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre-clé-anon-ou-publishable
```

**Exemple concret** :
```env
NEXT_PUBLIC_SUPABASE_URL=https://hhygdiodouofvrvxvzsl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeWdk...
```

### Étape 4 : Redémarrer le serveur de développement

⚠️ **IMPORTANT** : Après avoir modifié `.env.local`, vous devez **redémarrer** votre serveur Next.js :

1. Arrêtez le serveur (Ctrl+C dans le terminal)
2. Relancez-le avec `npm run dev`

### Étape 5 : Vérifier que ça fonctionne

1. Rechargez la page dans votre navigateur
2. Essayez de vous inscrire à nouveau
3. L'erreur "Invalid API key" devrait avoir disparu

## 📝 Notes importantes

- Le fichier `.env.local` est ignoré par Git (il ne sera pas commité)
- Ne partagez **jamais** vos clés API publiquement
- La clé `anon` ou `publishable` est publique et peut être utilisée côté client
- Si vous créez un nouveau projet Supabase, vous devrez aussi exécuter les migrations SQL (`001_schema.sql` et `002_seed_data.sql`)

## 🆘 Si ça ne fonctionne toujours pas

1. Vérifiez que le fichier s'appelle bien `.env.local` (avec le point au début)
2. Vérifiez qu'il est bien à la racine du projet (même niveau que `package.json`)
3. Vérifiez qu'il n'y a pas d'espaces autour du `=` dans les variables
4. Vérifiez que vous avez bien redémarré le serveur Next.js
5. Vérifiez dans la console du navigateur (F12) s'il y a d'autres erreurs

## 🔗 Liens utiles

- [Documentation Supabase - Getting Started](https://supabase.com/docs/guides/getting-started)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

