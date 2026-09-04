# Rapport — Application de Gestion de Tâches

**Projet d'entraînement :** Mise en production et maintenance applicative  
**Date :** 04/09/2026  
**Stack :** React · Node.js / Express · MongoDB  
**Repo GitHub :** [Vaezy/exam_clean](https://github.com/Vaezy/exam_clean)

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Architecture](#2-architecture)
3. [Environnements et URLs](#3-environnements-et-urls)
4. [E21 — Hébergement cloud et qualification](#4-e21--hébergement-cloud-et-qualification)
5. [E22 — Production sécurisée et administration](#5-e22--production-sécurisée-et-administration)
6. [E23 — DNS, déploiement et HTTPS](#6-e23--dns-déploiement-et-https)
7. [E24 — CI/CD et conteneurisation](#7-e24--cicd-et-conteneurisation)
8. [E25 — Journalisation et audit](#8-e25--journalisation-et-audit)
9. [E26 — Supervision et alertes](#9-e26--supervision-et-alertes)
10. [E27 — Bugs détectés et corrigés](#10-e27--bugs-détectés-et-corrigés)
11. [E28 — Failles de sécurité et corrections](#11-e28--failles-de-sécurité-et-corrections)
12. [E29 — Documentation et changelog](#12-e29--documentation-et-changelog)
13. [Déploiement production (Render + Atlas)](#13-déploiement-production-render--atlas)
14. [Variables d'environnement](#14-variables-denvironnement)
15. [Installation et lancement local](#15-installation-et-lancement-local)
16. [Tests et validations effectués](#16-tests-et-validations-effectués)
17. [Problèmes rencontrés et résolutions](#17-problèmes-rencontrés-et-résolutions)
18. [Fichiers modifiés / créés](#18-fichiers-modifiés--créés)
19. [Documents associés](#19-documents-associés)

---

## 1. Présentation

Application **To-Do List** avec authentification (inscription, connexion) et gestion de tâches (ajout, suppression).

Le projet initial contenait des **bugs**, des **failles de sécurité** et des **mauvaises pratiques** intentionnels. L'objectif était de les détecter, les corriger, documenter les évolutions et mettre en place l'infrastructure cloud (conteneurisation, CI/CD, logging, monitoring, déploiement).

**Lien application déployée :** https://exam-practice-app-lh5m.onrender.com

---

## 2. Architecture

```
Utilisateur (navigateur)
        │
        ▼
Frontend React (Render Static Site — HTTPS)
        │  REACT_APP_API_URL
        ▼
Backend Node.js / Express (Render Web Service — HTTPS)
        │  MONGO_URI
        ▼
MongoDB Atlas (cluster M0 FREE — AWS Paris eu-west-3)
```

**Composants :**

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Frontend | React 18 | Interface utilisateur (SPA) |
| Backend | Express + Node.js 20 | API REST (`/api/auth`, `/api/tasks`, `/api/health`) |
| Base de données | MongoDB Atlas | Persistance users + tasks |
| Auth | JWT (`jsonwebtoken`) + bcrypt | Authentification stateless |
| Reverse proxy (Docker local) | Nginx | Servir le build React |

---

## 3. Environnements et URLs

| Environnement | Rôle | Frontend | Backend | Health check |
|---------------|------|----------|---------|--------------|
| **Développement** | Codage et tests locaux | http://localhost:3000 | http://localhost:5000 | http://localhost:5000/api/health |
| **Qualification / Production** | Cloud public, tests finaux | https://exam-practice-app-lh5m.onrender.com | https://exam-practice-api-qigd.onrender.com | https://exam-practice-api-qigd.onrender.com/api/health |

> **Note préprod / prod :** Pour ce projet étudiant, **Render sert à la fois d'environnement de qualification et d'hébergement public**. Il n'y a pas de second déploiement production séparé. Le dev local reste distinct (localhost, HTTP).

**Pages utiles :**

- Login : https://exam-practice-app-lh5m.onrender.com/login
- Inscription : https://exam-practice-app-lh5m.onrender.com/register

---

## 4. E21 — Hébergement cloud et qualification

### Solution retenue

**Render** (frontend + backend) + **MongoDB Atlas** (base de données).

### Justification

| Critère | Render + Atlas |
|---------|----------------|
| Stack | Compatible Node.js / React / MongoDB |
| Coût | Gratuit (plan M0 Atlas + plan free Render) |
| Déploiement | Automatique depuis GitHub via `render.yaml` |
| HTTPS | Inclus nativement |
| Séparation | Application et base de données distinctes |

### Environnement de qualification

- Application déployée sur Render avec MongoDB Atlas, **séparée du dev local**
- Même configuration que la prod cloud : variables d'env, HTTPS, CORS, health check
- Parcours validés : inscription → connexion → ajout/suppression de tâches

### Source de vérité

- Code : GitHub `Vaezy/exam_clean`
- Secrets : variables d'environnement Render + `backend/.env` local (gitignoré)
- Valeurs réelles transmises au professeur en **message privé Discord** (non commitées)

---

## 5. E22 — Production sécurisée et administration

### Mise en œuvre sécurisée

| Mesure | Mise en œuvre |
|--------|---------------|
| **HTTPS** | Fourni nativement par Render |
| **Secrets hors du code** | `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN` dans Render ; `.env` dans `.gitignore` |
| **JWT robuste** | `JWT_SECRET` généré automatiquement par Render ; `validateEnv.js` au démarrage |
| **CORS restreint** | `CORS_ORIGIN=https://exam-practice-app-lh5m.onrender.com` en prod |
| **Protection applicative** | IDOR, XSS, validation des entrées (E28) |
| **Mode production** | `NODE_ENV=production` sur Render |

### Administration des services

**Render (dashboard) :**

- Services : `exam-practice-api` (Web Service Node.js), `exam-practice-app` (Static Site React)
- Gestion des variables d'environnement
- Logs en temps réel (stdout Winston)
- Redéploiement automatique à chaque push sur `main`
- Health check : `/api/health`

**MongoDB Atlas (dashboard) :**

- Cluster M0 FREE (région Paris `eu-west-3`)
- Database Access : utilisateur dédié à l'application
- Network Access : `0.0.0.0/0` (requis pour Render — IP dynamiques)
- Monitoring du cluster intégré

---

## 6. E23 — DNS, déploiement et HTTPS

### Noms de domaine

Render attribue automatiquement des sous-domaines `*.onrender.com` :

| Service | Domaine |
|---------|---------|
| Frontend | `exam-practice-app-lh5m.onrender.com` |
| Backend | `exam-practice-api-qigd.onrender.com` |

Pas d'achat de domaine externe — les sous-domaines Render suffisent pour ce projet.

### DNS

- **Cloud :** géré nativement par Render (aucune configuration manuelle)
- **Local :** `localhost` / `127.0.0.1` (pas de DNS public)

### HTTPS

- **Cloud :** certificats TLS **Let's Encrypt** provisionnés et renouvelés automatiquement par Render
- **Vérifications :** cadenas navigateur sur le frontend ; `/api/health` accessible en HTTPS
- **Local :** HTTP uniquement (environnement non exposé publiquement)

### Services déployés

Via `render.yaml` (Blueprint) depuis GitHub :

| Service Render | Type | Commande build | Health check |
|----------------|------|----------------|--------------|
| `exam-practice-api` | Web Service Node.js | `npm install` | `/api/health` |
| `exam-practice-app` | Static Site React | `npm install && npm run build` | — |

Routing SPA : rewrite `/* → /index.html` dans `render.yaml` + `frontend/public/_redirects`.

---

## 7. E24 — CI/CD et conteneurisation

### Conteneurisation Docker

| Fichier | Rôle |
|---------|------|
| `backend/Dockerfile` | Image Node.js 20 Alpine |
| `frontend/Dockerfile` | Build React multi-stage + Nginx |
| `frontend/nginx.conf` | Routing SPA React |
| `docker-compose.yml` | MongoDB + backend + frontend |
| `render.yaml` | Blueprint Render |

**Lancement local :**

```bash
docker compose up --build -d
# Frontend : http://localhost:3000
# Backend  : http://localhost:5000
# Health   : http://localhost:5000/api/health
```

Ou via : `./deploy.sh`

### Pipeline CI — GitHub Actions

Fichier : `.github/workflows/ci.yml`

**Déclenchement :** push ou pull request sur `main` / `master`

**Étapes :**

1. Checkout du code
2. Installation Node.js 20 (cache npm)
3. `npm install` backend + frontend
4. Tests frontend (`CI=true npm test`)
5. Construction des images Docker (`docker compose build`)

### Pipeline CD — Render

À chaque push sur `main`, Render rebuild et redéploie automatiquement frontend + backend.

### Schéma du flux

```
Développeur
    │
    ├─► ./deploy.sh          → environnement local (Docker)
    │
    └─► git push main
            │
            ├─► GitHub Actions (CI) : install → tests → docker build
            │
            └─► Render (CD) : build → déploiement cloud
```

---

## 8. E25 — Journalisation et audit

### Winston (`backend/utils/logger.js`)

| Paramètre | Valeur |
|-----------|--------|
| Niveau | `LOG_LEVEL` (défaut : `info`) |
| Format | JSON structuré + timestamp + stack trace |
| Métadonnée | `{ service: 'exam-practice-backend' }` |

**Destinations :**

| Destination | Fichier / canal | Contenu |
|-------------|-----------------|---------|
| Console | stdout (Render + dev) | Logs lisibles en temps réel |
| Fichier combiné | `backend/logs/combined.log` | Tous les logs |
| Fichier erreurs | `backend/logs/error.log` | Erreurs uniquement |

### Événements journalisés

- **Middleware HTTP** : méthode, chemin, status, `durationMs`
- **Démarrage serveur** : port d'écoute
- **MongoDB** : connexion OK / échec
- **Erreurs non gérées** : message + stack trace

### Outils d'audit

| Outil | Rôle |
|-------|------|
| **`npm audit`** | 7 vulnérabilités détectées → 3 modérées restantes après `npm audit fix` |
| **`CHANGELOG.md`** | Journal des évolutions (Keep a Changelog) |
| **`validateEnv.js`** | Audit de la configuration JWT au démarrage |

---

## 9. E26 — Supervision et alertes

### Endpoint de supervision

**`GET /api/health`** — réponse :

```json
{
  "status": "ok",
  "timestamp": "2026-09-04T14:30:00.000Z",
  "uptime": 3600.5
}
```

| Environnement | URL |
|---------------|-----|
| Local | http://localhost:5000/api/health |
| Cloud | https://exam-practice-api-qigd.onrender.com/api/health |

### Supervision par environnement

**Local :**

- Sonde `/api/health` (manuelle ou script)
- Logs Winston (`durationMs`, status, erreurs)
- Docker Compose : `restart: unless-stopped`

**Cloud (Render) :**

- `healthCheckPath: /api/health` dans `render.yaml` → redémarrage auto si unhealthy
- Logs Winston dans le dashboard Render
- GitHub Actions : pipeline CI en échec si tests/build cassent

### Indicateurs supervisés

| Indicateur | Source |
|------------|--------|
| Disponibilité | `/api/health` → `status: "ok"` |
| Uptime | Champ `uptime` |
| Latence | `durationMs` dans les logs HTTP |
| Erreurs | Status 4xx/5xx + `error.log` |
| Base de données | Log `MongoDB connected` / `connection failed` |

### Alertes couvertes

| Alerte | Mécanisme |
|--------|-----------|
| API indisponible | Échec du health check Render |
| Latence élevée | Champ `durationMs` dans les logs Winston |
| Erreurs serveur | Status 5xx dans les logs + `error.log` |

---

## 10. E27 — Bugs détectés et corrigés

**Méthode :** tests manuels des parcours utilisateur + observation UI et réponses API.

### Bug 1 — Liste non rafraîchie après ajout de tâche

| | |
|---|---|
| **Symptôme** | Tâche créée en base mais invisible sans rechargement |
| **Cause** | `addTask` vide dans `frontend/src/pages/Tasks.js` |
| **Correction** | `setTasks((prevTasks) => [task, ...prevTasks])` |

### Bug 2 — Erreurs de connexion silencieuses

| | |
|---|---|
| **Symptôme** | Échec login sans message visible |
| **Cause** | Erreurs loguées en console uniquement dans `Login.js` |
| **Correction** | État `error`, validation client, affichage message API |

### Bug 3 — Formulaires vides acceptés

| | |
|---|---|
| **Symptôme** | Titre vide, login/inscription avec champs vides |
| **Cause** | Pas de validation client ni serveur |
| **Correction** | `title.trim()` dans `TaskForm.js` ; validation Login/Register ; HTTP 400 sur `POST /api/tasks` |

### Bug 4 — Erreurs d'inscription silencieuses

| | |
|---|---|
| **Symptôme** | Échec inscription sans message |
| **Cause** | Pas d'état d'erreur dans `Register.js` |
| **Correction** | État `error` + affichage message API |

### Amélioration UX — Accès à l'inscription

- Lien « Inscription » dans le Header
- Bouton Inscription sur la page Login

---

## 11. E28 — Failles de sécurité et corrections

**Méthode :** analyse code, tests manuels (injection HTML, IDOR), revue config, `npm audit`.

### Faille 1 — IDOR

| | |
|---|---|
| **Risque** | Modifier/supprimer les tâches d'un autre utilisateur via son `_id` |
| **Correction** | Filtre `{ _id, user: req.user.id }` sur PUT/DELETE `/api/tasks/:id` |

### Faille 2 — XSS

| | |
|---|---|
| **Risque** | Stockage de HTML/JS en base (titres, descriptions, username) |
| **Correction** | `backend/utils/sanitize.js` — suppression des balises HTML |

### Faille 3 — CORS trop permissif

| | |
|---|---|
| **Risque** | Toute origine autorisée à appeler l'API |
| **Correction** | Restriction à `CORS_ORIGIN` ; origines locales en dev (`localhost`, `192.168.x.x`) |

### Faille 4 — Secret JWT faible

| | |
|---|---|
| **Risque** | `JWT_SECRET=secretkey123` forgeable |
| **Correction** | `validateEnv.js` + secret généré par Render en prod + `.env.example` |

### Faille 5 — Dépendances vulnérables

| | |
|---|---|
| **Risque** | 7 vulnérabilités npm (express, mongoose, jws, qs, etc.) |
| **Correction** | `npm audit fix` → 3 modérées restantes |

---

## 12. E29 — Documentation et changelog

### Documentation code (JSDoc)

**Route `POST /api/tasks`** — `backend/routes/tasks.js` :

- Description, accès privé (`x-auth-token`)
- Paramètres body, codes de réponse (400, 401, 500)
- Note sanitisation anti-XSS

**Composant `TaskForm`** — `frontend/src/components/TaskForm.js` :

- Rôle, prop `addTask`, validation, appel API, gestion erreurs

### Journal des évolutions

Fichier **`CHANGELOG.md`** (format [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)), mis à jour le 04/09/2026 :

- Bugs (E27), sécurité (E28), documentation, infra (E21–E26)
- Déploiement Render + URLs production
- Audit npm

### Documentation projet

| Fichier | Rôle |
|---------|------|
| `README.md` | Vue d'ensemble, URLs, installation, compétences |
| `DEPLOY.md` | Guide pas à pas Render + Atlas |
| `rapport.md` | Ce rapport de synthèse |
| `backend/.env.example` | Modèle variables d'env (secrets en MP Discord) |

---

## 13. Déploiement production (Render + Atlas)

### MongoDB Atlas — configuration

1. Cluster **M0 FREE** (AWS Paris `eu-west-3`)
2. **Database Access** : user avec rôle « Read and write to any database »
3. **Network Access** : `0.0.0.0/0` (Allow Access from Anywhere)
4. URI : `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/exam_practice_db`
5. Mot de passe avec caractères spéciaux → **encoder en URL** dans `MONGO_URI`  
   Exemple : `$` → `%24`, `@` → `%40`, `%` → `%25`

### Render — services déployés

| Service | Type | Nom |
|---------|------|-----|
| Backend | Web Service Node.js | `exam-practice-api` |
| Frontend | Static Site React | `exam-practice-app` |

### Corrections `render.yaml` appliquées

- `staticSites` → `services` avec `runtime: static`
- Suppression de `plan: free` sur le static site (erreur Render)
- `staticPublishPath: ./frontend/build`
- `healthCheckPath: /api/health`

### Notes production

- « Cannot GET / » sur la racine du backend est **normal** (API sous `/api/`)
- Plan gratuit Render → **cold start ~30–50 s** après inactivité

---

## 14. Variables d'environnement

### Backend local (`backend/.env` — gitignoré)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | URI MongoDB Atlas ou local |
| `JWT_SECRET` | Secret JWT (32+ caractères recommandés) |
| `CORS_ORIGIN` | Origines autorisées (optionnel en local) |
| `PORT` | Port du serveur (défaut : 5000) |

> Valeurs réelles transmises au professeur en **MP Discord**. Voir `backend/.env.example` pour le modèle.

### Backend Render (`exam-practice-api`)

| Variable | Valeur |
|----------|--------|
| `MONGO_URI` | URI Atlas (mot de passe encodé) |
| `JWT_SECRET` | Généré automatiquement par Render |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |
| `CORS_ORIGIN` | `https://exam-practice-app-lh5m.onrender.com` |

### Frontend Render (`exam-practice-app`)

| Variable | Valeur |
|----------|--------|
| `REACT_APP_API_URL` | `https://exam-practice-api-qigd.onrender.com/api` |

### Frontend local (optionnel)

| Variable | Valeur |
|----------|--------|
| `REACT_APP_API_URL` | `http://localhost:5000/api` |

---

## 15. Installation et lancement local

### Prérequis

- Node.js 20+
- MongoDB (Docker ou Atlas)
- Docker (optionnel)

### Option A — Dev avec Atlas (recommandé)

```bash
# Terminal 1
cd backend && npm install && npm start

# Terminal 2
cd frontend && npm install && npm start
```

MongoDB via `MONGO_URI` dans `backend/.env`.

### Option B — Dev avec MongoDB local (Docker)

```bash
docker compose up -d    # lance MongoDB uniquement
cd backend && npm start
cd frontend && npm start
```

### Option C — Tout en Docker

```bash
docker compose up --build -d
# ou
./deploy.sh
```

---

## 16. Tests et validations effectués

| Test | Environnement | Résultat |
|------|---------------|----------|
| Health check | Local + Render | `{ "status": "ok", ... }` |
| Inscription | Render | OK |
| Connexion | Render | OK |
| Ajout de tâche | Render | OK — liste rafraîchie sans reload |
| Suppression de tâche | Render | OK |
| Erreurs login (champs vides) | Local | Message affiché |
| Erreurs login (identifiants invalides) | Render | Message affiché |
| Validation titre vide | Local | Message affiché |
| HTTPS | Render | Cadenas actif |
| CORS | Render | Pas d'erreur avec frontend configuré |
| Pipeline CI | GitHub Actions | Install + tests + docker build |

---

## 17. Problèmes rencontrés et résolutions

| Problème | Cause | Solution |
|----------|-------|----------|
| **Invalid credentials** au login | Compte non créé sur Atlas (BDD vide) | S'inscrire d'abord via `/register` |
| **Network Error** sur `/tasks` | CORS bloquait `192.168.x.x` | Origines locales autorisées en dev dans `server.js` |
| **Échec deploy Render** | `staticSites` invalide dans `render.yaml` | Passage à `services` + `runtime: static` |
| **Échec deploy static site** | `plan: free` sur static site | Suppression de `plan: free` |
| **Frontend ne trouve pas l'API** | `REACT_APP_API_URL` incorrect (suffixe `-qigd` manquant) | Correction URL backend Render |
| **Erreur CORS en prod** | `CORS_ORIGIN` non configuré | URL frontend exacte dans Render |
| **MongoDB connection failed** | Mot de passe avec `$`, `@`, `%` non encodé | Encodage URL dans `MONGO_URI` |
| **Page 404 en rafraîchissant `/tasks`** | Routing SPA absent | Rewrite `/* → /index.html` dans `render.yaml` |
| **Backend lent au 1er appel** | Cold start plan gratuit Render | Normal (~30–50 s) |
| **Cannot GET /** sur backend | Pas de route racine | Normal — API sous `/api/` |

---

## 18. Fichiers modifiés / créés

### Backend

| Fichier | Modification |
|---------|--------------|
| `backend/routes/tasks.js` | IDOR, sanitisation, validation, JSDoc |
| `backend/routes/auth.js` | Sanitisation username |
| `backend/server.js` | CORS, Winston, health check |
| `backend/config/db.js` | Logger Winston |
| `backend/utils/sanitize.js` | Anti-XSS |
| `backend/utils/validateEnv.js` | Validation JWT |
| `backend/utils/logger.js` | Winston |
| `backend/Dockerfile` | Créé |
| `backend/.env.example` | Créé / documenté |

### Frontend

| Fichier | Modification |
|---------|--------------|
| `frontend/src/pages/Tasks.js` | Fix `addTask` |
| `frontend/src/pages/Login.js` | Erreurs + bouton inscription |
| `frontend/src/pages/Register.js` | Erreurs |
| `frontend/src/components/TaskForm.js` | Validation + JSDoc |
| `frontend/src/components/Header.js` | Lien inscription |
| `frontend/src/api.js` | `REACT_APP_API_URL` |
| `frontend/src/App.css` | Styles `error-message` |
| `frontend/Dockerfile` | Créé |
| `frontend/nginx.conf` | Créé |
| `frontend/public/_redirects` | Routing SPA Render |
| `frontend/.env.example` | Créé |

### Racine

| Fichier | Rôle |
|---------|------|
| `docker-compose.yml` | Orchestration MongoDB + backend + frontend |
| `render.yaml` | Blueprint Render |
| `deploy.sh` | Script déploiement local |
| `CHANGELOG.md` | Journal des évolutions |
| `DEPLOY.md` | Guide déploiement |
| `README.md` | Documentation principale |
| `rapport.md` | Ce rapport |
| `.gitignore` | Exclusion `.env`, `node_modules`, logs |
| `.github/workflows/ci.yml` | Pipeline GitHub Actions |

---

## 19. Documents associés

| Document | Lien |
|----------|------|
| README | [`README.md`](README.md) |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) |
| Guide déploiement | [`DEPLOY.md`](DEPLOY.md) |
| Application live | https://exam-practice-app-lh5m.onrender.com |
| Repo GitHub | https://github.com/Vaezy/exam_clean |

---

*Fin du rapport — 04/09/2026*
