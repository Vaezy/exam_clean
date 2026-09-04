# Déploiement sur Render + MongoDB Atlas

Guide pas à pas pour mettre l'application en production.

## Architecture

```
Frontend (Render Static Site)  →  Backend (Render Web Service)  →  MongoDB Atlas
```

---

## Étape 1 — MongoDB Atlas (gratuit)

1. Crée un compte sur [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster** → choisis **M0 FREE**
3. **Database Access** → Add User (note le login + mot de passe)
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. **Connect** → Drivers → copie l'URI, ex :
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/exam_practice_db?retryWrites=true&w=majority
   ```
   Remplace `USER`, `PASSWORD` et garde le nom de base `exam_practice_db`.

---

## Étape 2 — Pousser le code sur GitHub

Render déploie depuis un repo Git.

```bash
cd "chemin/vers/exam_practice_app_clean"

git init
git add .
git commit -m "Prepare deployment for Render"

# Crée un repo vide sur GitHub, puis :
git remote add origin https://github.com/TON_USER/TON_REPO.git
git branch -M main
git push -u origin main
```

> Ne commite **jamais** le fichier `backend/.env` (déjà dans `.gitignore`).

---

## Étape 3 — Déployer sur Render (Blueprint)

1. Va sur [https://dashboard.render.com](https://dashboard.render.com)
2. **New +** → **Blueprint**
3. Connecte ton repo GitHub
4. Render détecte le fichier `render.yaml` à la racine
5. Renseigne les variables marquées **sync: false** :
   - **Backend `MONGO_URI`** : ton URI Atlas (étape 1)
   - **Backend `CORS_ORIGIN`** : laisse vide pour l'instant, tu la mets à l'étape 5
   - **Frontend `REACT_APP_API_URL`** : `https://exam-practice-api.onrender.com/api`  
     (remplace par l'URL réelle de ton backend Render)
6. Clique **Apply**

Attends que les 2 services soient **Live** (5–10 min).

---

## Étape 4 — Vérifier le backend

Ouvre dans le navigateur :
```
https://TON-BACKEND.onrender.com/api/health
```

Tu dois voir :
```json
{ "status": "ok", "timestamp": "...", "uptime": ... }
```

> Plan gratuit : la 1ère requête après inactivité peut prendre ~30 s (cold start).

---

## Étape 5 — Finaliser CORS

1. Copie l'URL de ton **frontend** Render, ex : `https://exam-practice-app.onrender.com`
2. Render Dashboard → service **exam-practice-api** → **Environment**
3. Mets à jour **`CORS_ORIGIN`** avec l'URL du frontend (sans `/` à la fin)
4. Le backend redémarre automatiquement

---

## Étape 6 — Tester l'application

1. Ouvre l'URL du frontend
2. **Inscription** → crée un compte
3. **Connexion** → accède aux tâches
4. **Ajoute / supprime** une tâche

---

## URLs à noter pour ton rendu

| Service | URL |
|---------|-----|
| Frontend | `https://exam-practice-app.onrender.com` |
| Backend API | `https://exam-practice-api.onrender.com/api` |
| Health check | `https://exam-practice-api.onrender.com/api/health` |
| MongoDB | MongoDB Atlas (cloud) |

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Network Error sur `/tasks` | Vérifie `REACT_APP_API_URL` et rebuild le frontend |
| Erreur CORS | Vérifie `CORS_ORIGIN` = URL exacte du frontend |
| MongoDB connection failed | Vérifie URI Atlas, user/password, IP `0.0.0.0/0` |
| Backend lent au 1er chargement | Normal sur le plan gratuit (cold start) |
| Page 404 en rafraîchissant `/tasks` | Le rewrite SPA dans `render.yaml` doit être actif |

---

## Déploiement manuel (sans Blueprint)

### Backend — Web Service

| Champ | Valeur |
|-------|--------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

### Frontend — Static Site

| Champ | Valeur |
|-------|--------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `build` |

Ajoute une rewrite rule : `/*` → `/index.html`
