# 🗺 Grenat — Annuaire des guides

Site d'annuaire des guides Grenat, connecté à Notion, hébergé sur Vercel.

---

## 🚀 Mise en ligne — Guide pas à pas

### ÉTAPE 1 — Créer une intégration Notion (5 min)

1. Va sur https://www.notion.so/my-integrations
2. Clique **"+ Nouvelle intégration"**
3. Donne-lui le nom : `Grenat Annuaire`
4. Laisse tout par défaut → clique **Enregistrer**
5. **Copie le "Token d'intégration interne"** — il commence par `secret_...`
   → Garde-le précieusement, tu en auras besoin à l'étape 4

6. Retourne sur ta base de données Notion
7. Clique les **`...`** en haut à droite de la page
8. Dans le menu → **"Connexions"** → cherche et sélectionne **"Grenat Annuaire"**
9. Confirme

---

### ÉTAPE 2 — Créer un compte GitHub (5 min)

1. Va sur https://github.com
2. Clique **"Sign up"** — inscription gratuite
3. Choisis un nom d'utilisateur, entre ton email, crée un mot de passe
4. Vérifie ton email

---

### ÉTAPE 3 — Mettre le code sur GitHub (5 min)

1. Une fois connecté sur GitHub, clique le **"+"** en haut à droite
2. Sélectionne **"New repository"**
3. Nom du dépôt : `grenat-annuaire`
4. Laisse tout le reste par défaut → clique **"Create repository"**

5. Sur la page du nouveau dépôt, clique **"uploading an existing file"**
6. **Décompresse le fichier ZIP** que tu as téléchargé
7. **Glisse-dépose TOUS les fichiers et dossiers** dans la zone d'upload GitHub
   (il faut uploader : `pages/`, `lib/`, `styles/`, `public/`, `package.json`, `next.config.js`)
8. En bas de la page, clique **"Commit changes"**

---

### ÉTAPE 4 — Créer un compte Vercel et déployer (5 min)

1. Va sur https://vercel.com
2. Clique **"Sign Up"** → choisis **"Continue with GitHub"** (utilise ton compte GitHub)
3. Autorise Vercel à accéder à GitHub

4. Sur le dashboard Vercel, clique **"Add New… → Project"**
5. Tu vois ton dépôt `grenat-annuaire` → clique **"Import"**

6. **⚠️ IMPORTANT — Variables d'environnement :**
   Avant de cliquer "Deploy", ouvre la section **"Environment Variables"**
   - Name : `NOTION_TOKEN`
   - Value : colle ton token Notion (celui qui commence par `secret_...`)
   - Clique **"Add"**

7. Clique **"Deploy"** 🎉

Vercel va builder le site automatiquement (2-3 min).
Tu recevras une URL du type : `https://grenat-annuaire.vercel.app`

---

### ÉTAPE 5 — Lier depuis Framer (2 min)

1. Dans Framer, va sur ta page Annuaire
2. Ajoute un bouton ou lien vers ton URL Vercel
3. C'est tout !

---

## 🔄 Mise à jour des données

Le site se met à jour **automatiquement toutes les 5 minutes** depuis Notion.  
Tu n'as rien à faire : modifie un guide dans Notion → le site est à jour dans les 5 minutes.

---

## 🎨 Personnalisation facile

Pour changer les couleurs, ouvre `styles/globals.css` et modifie les valeurs dans `:root {}` :

```css
--cyan:    #00CEC6;   /* couleur des tags département */
--magenta: #CC0060;   /* couleur des tags langue */
```

Pour changer l'URL de retour vers le site principal, cherche `cuddly-deliberate-838847.framer.app` dans les fichiers et remplace par ta future URL de domaine.

---

## ❓ Problèmes fréquents

**"NOTION_TOKEN manquant"**  
→ Vérifie que la variable d'environnement est bien configurée dans Vercel (Settings → Environment Variables)

**Les photos ne s'affichent pas**  
→ Normal si les guides n'ont pas encore ajouté leur photo dans Notion. L'initiale s'affiche à la place.

**Un guide n'apparaît pas**  
→ Vérifie que son "Statut" est bien "Guide actif" dans Notion

---

## 📧 Support

Site créé par Claude (Anthropic) pour Grenat — Vos guides en Auvergne-Rhône-Alpes.
