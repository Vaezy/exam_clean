# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [Non publié] — 2026-09-04

### Corrigé — Bugs fonctionnels (E27)

- **Liste des tâches non rafraîchie** : `addTask` dans `Tasks.js` met à jour l'état React immédiatement après création.
- **Erreurs de connexion silencieuses** : messages d'erreur visibles dans `Login.js` (validation + réponse API).
- **Erreurs d'inscription silencieuses** : messages d'erreur visibles dans `Register.js`.
- **Formulaires vides acceptés** : validation côté client (Login, Register, TaskForm) et côté serveur (`POST /api/tasks`).

### Sécurité — Failles corrigées (E28)

- **IDOR** : les routes `PUT` et `DELETE /api/tasks/:id` vérifient que la tâche appartient à l'utilisateur connecté.
- **XSS** : sanitisation des entrées (titres, descriptions, username) via `backend/utils/sanitize.js`.
- **CORS trop permissif** : restriction aux origines définies dans `CORS_ORIGIN` (+ origines locales en dev).
- **JWT secret faible** : validation au démarrage (`validateEnv.js`) + fichier `.env.example` documenté.

### Documentation (E29)

- JSDoc ajoutée sur la route `POST /api/tasks` (`backend/routes/tasks.js`).
- Documentation JSDoc ajoutée sur le composant `TaskForm` (`frontend/src/components/TaskForm.js`).
- Création de ce fichier `CHANGELOG.md`.

### Infrastructure — Déploiement, CI/CD, Monitoring (E21–E26)

- **Docker** : `Dockerfile` backend + frontend (multi-stage Nginx), `docker-compose.yml` complet (MongoDB + backend + frontend).
- **CI/CD** : script `deploy.sh` + pipeline GitHub Actions (`.github/workflows/ci.yml`).
- **Logging** : Winston remplace `console.log` — fichiers `logs/combined.log` et `logs/error.log`.
- **Monitoring** : endpoint `GET /api/health` pour sondes (Uptime Kuma, Prometheus).
- **Architecture cloud** : schéma Scaleway documenté dans le README.
- **Déploiement Render** : `render.yaml` + guide `DEPLOY.md` (Render + MongoDB Atlas).

### Dépendances

- `npm audit` exécuté : 7 vulnérabilités détectées (express, mongoose, jws, qs, body-parser, path-to-regexp, ip-address).
- Mise à jour recommandée : `npm install express@latest mongoose@latest jsonwebtoken@latest`.
- `npm audit fix` : timeout réseau sur l'endpoint sécurité npm (correction manuelle possible).

---

## [Initial] — Version de départ

- Application To-Do List (React + Express + MongoDB) fournie avec bugs et failles intentionnels pour l'entraînement examen.
