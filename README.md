# Application de Gestion de Tâches

Projet d'entraînement — **Mise en production et maintenance applicative**  
Stack : **React** (frontend) · **Node.js / Express** (backend) · **MongoDB** (base de données)

---

## Présentation

Application To-Do List avec authentification (inscription, connexion) et gestion de tâches (ajout, suppression).

Le projet initial contenait des bugs, failles de sécurité et mauvaises pratiques intentionnels. Ils ont été corrigés et documentés (voir sections compétences ci-dessous).

**Documents associés :**
- [`CHANGELOG.md`](CHANGELOG.md) — journal des évolutions
- [`DEPLOY.md`](DEPLOY.md) — guide de déploiement Render + Atlas
- [`rapport.md`](rapport.md) — rapport complet de synthèse

---

## URLs et environnements

| Environnement | Frontend | Backend | Health check |
|---------------|----------|---------|--------------|
| **Développement** | http://localhost:3000 | http://localhost:5000 | http://localhost:5000/api/health |
| **Qualification / pré-production** | https://exam-practice-app-lh5m.onrender.com | https://exam-practice-api-qigd.onrender.com | https://exam-practice-api-qigd.onrender.com/api/health |

> **Note :** Pour ce projet, Render sert d'environnement de **qualification** (cloud, HTTPS, MongoDB Atlas) et d'**hébergement public**. Il n'y a pas de second déploiement production séparé. Une évolution possible : Scaleway/AWS avec nom de domaine personnalisé.

**Repo GitHub :** [Vaezy/exam_clean](https://github.com/Vaezy/exam_clean)

---

## Installation locale

### Prérequis

- Node.js 20+
- MongoDB (local via Docker **ou** MongoDB Atlas)

### Backend

```bash
cd backend
cp .env.example .env   # puis renseigner MONGO_URI et JWT_SECRET
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker (tout l'environnement)

```bash
docker compose up --build -d
```

Ou via le script : `./deploy.sh`

---

## Déploiement cloud (Render + MongoDB Atlas)

```
Frontend (Render)  →  Backend (Render)  →  MongoDB Atlas
```

1. Créer un cluster **M0 FREE** sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Pousser le code sur GitHub
3. Render → **New Blueprint** → connecter le repo (`render.yaml`)
4. Configurer les variables d'environnement :

| Service | Variable | Valeur |
|---------|----------|--------|
| Backend | `MONGO_URI` | URI Atlas (mot de passe URL-encodé si caractères spéciaux) |
| Backend | `CORS_ORIGIN` | URL du frontend Render |
| Frontend | `REACT_APP_API_URL` | `https://<backend>.onrender.com/api` |

Guide détaillé : [`DEPLOY.md`](DEPLOY.md)

---

## Compétences réalisées

### E27 — Bugs corrigés

| Bug | Correction |
|-----|------------|
| Liste non rafraîchie après ajout de tâche | `setTasks` dans `Tasks.js` |
| Erreurs de connexion silencieuses | Messages d'erreur dans `Login.js` |
| Erreurs d'inscription silencieuses | Messages d'erreur dans `Register.js` |
| Formulaires vides acceptés | Validation client + serveur |
| Pas de lien inscription | Bouton/lien ajouté (Header + Login) |

### E28 — Failles de sécurité corrigées

| Faille | Risque | Correction |
|--------|--------|------------|
| **IDOR** | Accès aux tâches d'autres users | Filtre `{ _id, user }` sur PUT/DELETE |
| **XSS** | Injection HTML/JS en base | `backend/utils/sanitize.js` |
| **CORS ouvert** | Requêtes depuis n'importe quelle origine | Variable `CORS_ORIGIN` |
| **JWT faible** | Tokens forgeables | `validateEnv.js` + `.env.example` |

Audit dépendances : `npm audit` exécuté (voir `CHANGELOG.md`).

### E29 — Documentation

- JSDoc sur `POST /api/tasks` → `backend/routes/tasks.js`
- JSDoc sur le composant `TaskForm` → `frontend/src/components/TaskForm.js`
- Journal des évolutions → `CHANGELOG.md`

### E21 — Hébergement cloud

**Solution retenue :** Render (FE + BE) + MongoDB Atlas (BDD).

**Justification :** adapté à la stack, gratuit, déploiement Git, HTTPS natif, séparation app/données.

**Qualification :** environnement Render distinct du dev local, utilisé pour valider register/login/tâches.

**Alternative envisagée :** Scaleway (architecture cible documentée ci-dessous).

### E24 — Conteneurisation & CI/CD

| Fichier | Rôle |
|---------|------|
| `backend/Dockerfile` | Image Node.js 20 |
| `frontend/Dockerfile` | Build React + Nginx |
| `docker-compose.yml` | MongoDB + backend + frontend |
| `render.yaml` | Blueprint Render |
| `deploy.sh` | Script de déploiement local |
| `.github/workflows/ci.yml` | Pipeline GitHub Actions |

### E25 — Logging

**Winston** (`backend/utils/logger.js`) : logs JSON dans `logs/combined.log` et `logs/error.log`, console en dev, middleware HTTP (méthode, status, durée).

### E26 — Monitoring

- Endpoint : `GET /api/health` → `{ status, timestamp, uptime }`
- Outils proposés : Uptime Kuma, Prometheus + Grafana
- Alertes : API down · Latence > 500 ms · Erreurs 5xx > 5 %

### E21–E23 — Architecture cible (Scaleway)

```
Utilisateur → Cloudflare DNS (HTTPS)
           → Load Balancer (Scaleway)
           → Frontend (container) + Backend (container)
           → MongoDB managé
```

- DNS : `todos.mondomaine.fr` → Load Balancer
- HTTPS : Let's Encrypt / Cloudflare
- Secrets : variables d'environnement (jamais dans le code)

---

## Structure du projet

```
exam_practice_app_clean/
├── backend/          # API Express + MongoDB
├── frontend/         # Application React
├── docker-compose.yml
├── render.yaml
├── deploy.sh
├── CHANGELOG.md
├── DEPLOY.md
├── rapport.md
└── README.md
```

---

## Variables d'environnement

Copier `backend/.env.example` vers `backend/.env` :

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=secret_aleatoire_32_caracteres_minimum
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

Frontend (optionnel en local) : `frontend/.env.example` → `REACT_APP_API_URL`
