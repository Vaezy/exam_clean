# Projet d'Entraînement : Application de Gestion de Tâches

Bienvenue sur le projet d'entraînement pour l'évaluation "Mise en production et maintenance applicative". Cette application est une simple "To-Do List" composée d'un frontend en React et d'un backend en Node.js/Express.

**Important** : Cette application a été intentionnellement conçue avec des bugs, des failles de sécurité et des mauvaises pratiques. Votre mission est de l'améliorer en suivant les consignes ci dessous et de faire la mise en production.

## 1. Installation et Lancement

Ce projet utilise Node.js et MongoDB. Assurez-vous qu'ils sont installés sur votre système.

### a. Backend

```bash
# Allez dans le dossier du backend
cd backend

# Installez les dépendances
npm install

# Lancez le serveur (il se connectera à MongoDB)
# Assurez-vous que votre service MongoDB est démarré
npm start
# Le serveur tournera sur http://localhost:5000
```

### b. Frontend

```bash
# Depuis un autre terminal, allez dans le dossier du frontend
cd frontend

# Installez les dépendances
npm install

# Lancez l'application React
npm start
# L'application s'ouvrira sur http://localhost:3000
```

### c. Lancement complet avec Docker (E24)

```bash
# Depuis la racine du projet
docker compose up --build -d

# Frontend : http://localhost:3000
# Backend  : http://localhost:5000
# Health   : http://localhost:5000/api/health
```

Ou via le script de déploiement :

```bash
chmod +x deploy.sh   # Linux/Mac — sous Git Bash sur Windows
./deploy.sh
```

---

## 2. Mission pour les Étudiants

Votre objectif est d'analyser, corriger et améliorer cette application pour la rendre prête pour une mise en production, en suivant les compétences de votre référentiel.

### ✓ E27 – Détection des bugs et mesures correctives

Le code contient plusieurs bugs fonctionnels et d'interface.

**Pistes de réflexion :**

- Testez l'application : créez un compte, connectez-vous, ajoutez, modifiez et supprimez des tâches.
- Que se passe-t-il si vous soumettez des formulaires vides ?
- La mise à jour de l'interface est-elle toujours immédiate après une action ?
- Le feedback utilisateur en cas d'erreur (ex: mauvais login) est-il suffisant ?
- Autres ....
- **Action :** Identifiez au moins 3 bugs, décrivez-les, et proposez une correction dans le code.

#### Bugs identifiés et corrigés

**Bug 1 — L'interface ne se met pas à jour après l'ajout d'une tâche**

- **Description :** Dans `frontend/src/pages/Tasks.js`, la fonction `addTask` était vide. Après avoir ajouté une tâche via le formulaire, l'utilisateur devait rafraîchir la page manuellement pour la voir apparaître dans la liste.
- **Correction :** Mise à jour immédiate de l'état React avec la nouvelle tâche retournée par l'API :
  ```js
  setTasks((prevTasks) => [task, ...prevTasks]);
  ```

**Bug 2 — Aucun retour utilisateur en cas d'échec de connexion**

- **Description :** Dans `frontend/src/pages/Login.js`, les erreurs (identifiants invalides, champs vides) étaient uniquement loguées dans la console (`console.error`). L'utilisateur ne voyait aucun message et ne comprenait pas pourquoi la connexion avait échoué.
- **Correction :** Ajout d'un état `error`, validation des champs vides côté client, et affichage du message d'erreur renvoyé par l'API (`Invalid credentials`, etc.).

**Bug 3 — Soumission de formulaires vides (tâches et authentification)**

- **Description :**
  - Le formulaire d'ajout de tâche (`TaskForm.js`) acceptait un titre vide ou composé uniquement d'espaces.
  - Les formulaires de connexion et d'inscription n'avaient pas de validation côté client avant l'appel API.
  - Le backend (`backend/routes/tasks.js`) n'effectuait pas de validation sur le titre avant la création en base.
- **Correction :**
  - Validation `title.trim()` dans `TaskForm.js` avec message d'erreur visible.
  - Validation des champs vides dans `Login.js` et `Register.js`.
  - Validation côté serveur dans la route `POST /api/tasks` (retour HTTP 400 si titre absent).

**Bug 4 — Aucun retour utilisateur en cas d'échec d'inscription**

- **Description :** Comme pour le login, `Register.js` ne montrait aucun message lorsque l'inscription échouait (utilisateur déjà existant, champs manquants, etc.).
- **Correction :** Ajout d'un état `error` et affichage du message renvoyé par l'API.

### ✓ E28 – Détection des failles de sécurité et mesures correctives

L'application présente plusieurs vulnérabilités.

**Pistes de réflexion :**

- **Validation des entrées** : Que se passe-t-il si vous entrez du code HTML ou JavaScript (`<script>alert('test')</script>`) dans les formulaires ? (Faille XSS)
- **Contrôle d'accès** : Un utilisateur peut-il voir ou modifier les données d'un autre utilisateur ? (Faille IDOR - Insecure Direct Object Reference). Regardez les routes `PUT` et `DELETE` dans `backend/routes/tasks.js`.
- **Gestion des secrets** : Le secret `JWT_SECRET` dans le fichier `.env` est-il robuste ? Comment devrait-il être géré en production ?
- **Dépendances** : Les dépendances du projet (`package.json`) sont-elles à jour ? Utilisez `npm audit` pour vérifier.
- **Configuration** : La configuration CORS dans `backend/server.js` est-elle trop permissive pour une production ?
- Autres ....
- **Action :** Identifiez au moins 2 failles de sécurité, expliquez le risque associé et corrigez-les.

#### Failles identifiées et corrigées

**Faille 1 — IDOR sur les routes PUT et DELETE des tâches**

- **Risque :** Un utilisateur authentifié pouvait modifier ou supprimer les tâches d'un autre utilisateur s'il connaissait l'identifiant MongoDB (`_id`) de la tâche. Violation de confidentialité et d'intégrité des données (faille IDOR — _Insecure Direct Object Reference_).
- **Correction :** Les routes `PUT /api/tasks/:id` et `DELETE /api/tasks/:id` filtrent désormais par `{ _id, user: req.user.id }`. Seul le propriétaire de la tâche peut la modifier ou la supprimer.

**Faille 2 — Absence de sanitisation des entrées (XSS)**

- **Risque :** Du code HTML/JavaScript (`<script>alert('test')</script>`) pouvait être stocké en base dans les titres, descriptions ou noms d'utilisateur. Si ces données sont un jour affichées sans échappement (ou via une autre interface), un attaquant pourrait exécuter du code malveillant dans le navigateur d'une victime (faille XSS — _Cross-Site Scripting_).
- **Correction :** Ajout d'un utilitaire `backend/utils/sanitize.js` qui supprime les balises HTML. Appliqué à la création/mise à jour des tâches et à l'inscription utilisateur.

**Faille 3 — CORS trop permissif**

- **Risque :** `app.use(cors())` sans restriction autorise **toutes** les origines à appeler l'API. En production, un site malveillant pourrait faire des requêtes authentifiées au nom d'un utilisateur connecté.
- **Correction :** CORS limité aux origines définies dans `CORS_ORIGIN` (par défaut `http://localhost:3000` en développement). Voir `backend/.env.example`.

**Faille 4 — Secret JWT faible et non documenté**

- **Risque :** Le `JWT_SECRET=secretkey123` du `.env` est prévisible et court. Un attaquant pourrait forger des tokens JWT valides et usurper l'identité de n'importe quel utilisateur.
- **Correction :**
  - Ajout de `backend/utils/validateEnv.js` : vérifie la présence du secret et affiche un avertissement s'il fait moins de 32 caractères.
  - Création de `backend/.env.example` documentant les bonnes pratiques (secret long, généré aléatoirement, jamais commité, géré via variables d'environnement du serveur en production).

**Piste complémentaire — Dépendances (`npm audit`)**

- Exécuter régulièrement `npm audit` dans `backend/` et `frontend/` pour détecter les vulnérabilités connues dans les packages npm, puis mettre à jour les dépendances concernées.

### ✓ E29 – Génération de la documentation et journal des évolutions

Le code n'est pas documenté et il n'y a pas de suivi des changements.

**Pistes de réflexion :**

- **Documentation du code source** : Comment pourriez-vous documenter les fonctions, les routes de l'API et les composants React ? Des outils comme **JSDoc** (`/** ... */`) pour le backend JavaScript et les commentaires standards pour React peuvent être utilisés.
- **Journal des évolutions (Changelog)** : Vous allez apporter des modifications. Comment les tracer ? Créez un fichier `CHANGELOG.md` à la racine du projet et documentez-y chaque bug et faille de sécurité que vous corrigez.
- **Action :**
  1.  Documentez au moins une route de l'API backend et un composant React frontend en utilisant les commentaires de documentation (fournir des precisions sur ce que vous avez fait ..).
  2.  Créez et maintenez un `CHANGELOG.md`.

#### Documentation réalisée

**1. Route API documentée (JSDoc) — `POST /api/tasks`**

Fichier : `backend/routes/tasks.js`

Documentation ajoutée avec le format JSDoc (`/** ... */`) :
- Description de la route et niveau d'accès (privé, token requis)
- Paramètres du body (`title`, `description`)
- Codes de réponse possibles (200, 400, 401, 500)
- Note sur la sanitisation anti-XSS appliquée avant enregistrement

**2. Composant React documenté — `TaskForm`**

Fichier : `frontend/src/components/TaskForm.js`

Documentation ajoutée avec JSDoc :
- Rôle du composant (formulaire d'ajout de tâche)
- Props (`addTask` et son usage)
- Comportement : validation client, appel API, gestion des erreurs, reset du formulaire
- Documentation de la fonction `handleSubmit`

**3. Journal des évolutions — `CHANGELOG.md`**

Fichier créé à la racine du projet. Il recense :
- Tous les bugs corrigés (E27)
- Toutes les failles de sécurité corrigées (E28)
- Les ajouts de documentation et d'infrastructure
- Le suivi des dépendances (`npm audit`)

### ✓ E21 à E26 – Déploiement, CI/CD, Monitoring

Ces points concernent l'infrastructure et l'automatisation.

**Pistes de réflexion :**

- **Conteneurisation (E24)** : Comment mettriez-vous cette application (frontend et backend) dans des conteneurs Docker ? Créez un `Dockerfile` pour le backend et un autre pour le frontend. Créez un fichier `docker-compose.yml` pour orchestrer les deux services ainsi qu'une base de données MongoDB.
- **CI/CD (E24)** : Comment automatiser le déploiement ? Écrivez un petit script `deploy.sh` ou décrivez les étapes d'un pipeline (ex: GitHub Actions, GitLab CI) qui pourrait :
  1.  Installer les dépendances.
  2.  Lancer les tests (que vous pourriez écrire !).
  3.  Construire les images Docker.
  4.  Pousser les images vers un registre (Docker Hub, etc.).
- **Journalisation (Logging) (E25)** : Les `console.log` actuels sont-ils suffisants ? Proposez une solution de logging plus robuste (ex: Winston, Pino) pour le backend, qui pourrait logger dans des fichiers ou envoyer les logs vers un service centralisé.
- **Monitoring et Alertes (E26)** : Comment surveiller que votre application est en bonne santé ? Proposez des outils (ex: Prometheus, Grafana, Uptime Kuma) et définissez 2 ou 3 alertes pertinentes (ex: "API down", "Latence > 500ms", "Taux d'erreur > 5%" ...) - sinon vous pourrez utiliser et decrire le solutions proposer pour le service d'hebergement que vous avez choisi

- **Hébergement, DNS, Sécurité (E21, E22, E23)** : Décrivez une architecture cible sur un fournisseur cloud (ex: AWS, Azure, GCP, Scaleway...). Où hébergeriez-vous les conteneurs ? La base de données ? Comment configureriez-vous le nom de domaine et le certificat HTTPS ?

#### Réalisations

**E24 — Conteneurisation Docker**

| Fichier | Rôle |
|---------|------|
| `backend/Dockerfile` | Image Node.js 20 Alpine pour l'API Express |
| `frontend/Dockerfile` | Build React + serveur Nginx (multi-stage) |
| `frontend/nginx.conf` | Configuration Nginx (routing SPA React) |
| `docker-compose.yml` | Orchestration MongoDB + backend + frontend |

**Lancer toute l'application en Docker :**

```bash
docker compose up --build -d
```

- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- Health check : http://localhost:5000/api/health

**E24 — CI/CD**

| Fichier | Rôle |
|---------|------|
| `deploy.sh` | Script local : install → tests → build Docker → déploiement |
| `.github/workflows/ci.yml` | Pipeline GitHub Actions (install, tests, build Docker) |

Étapes du pipeline :
1. Installation des dépendances (backend + frontend)
2. Tests frontend (`npm test`)
3. Construction des images Docker (`docker compose build`)
4. *(Production)* Push vers Docker Hub / Scaleway Registry (commenté, à activer avec secrets CI)

**E25 — Journalisation (Winston)**

- Remplacement des `console.log` par **Winston** (`backend/utils/logger.js`)
- Logs structurés en JSON dans `backend/logs/combined.log` et `backend/logs/error.log`
- Logs console colorés en développement
- Middleware HTTP : chaque requête est loguée (méthode, chemin, status, durée)

**E26 — Monitoring et alertes**

Endpoint de santé : `GET /api/health` retourne `{ status, timestamp, uptime }`.

**Outils proposés :**

| Outil | Usage |
|-------|-------|
| **Uptime Kuma** | Sonde HTTP sur `/api/health` — alerte si l'API ne répond plus |
| **Prometheus + Grafana** | Métriques (latence, taux d'erreur, uptime) via logs Winston ou exporter |
| **Alertes** | 1. API down (health check échoue 3×) · 2. Latence > 500 ms · 3. Taux d'erreur HTTP 5xx > 5 % |

**E21–E23 — Architecture cloud cible (Scaleway)**

```
                    ┌─────────────────┐
   Utilisateur ──► │  Cloudflare DNS  │  (HTTPS / certificat SSL)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Load Balancer    │  (Scaleway LB)
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐      │
     │ Frontend    │  │ Backend     │      │
     │ (Container) │  │ (Container) │      │
     │ Nginx/React │  │ Node/Express│      │
     └─────────────┘  └──────┬──────┘      │
                               │             │
                    ┌──────────▼──────────┐  │
                    │ MongoDB Managed DB   │  │
                    │ (Scaleway Database)  │  │
                    └─────────────────────┘  │
```

- **Conteneurs** : Scaleway Container / Kubernetes Kapsule
- **Base de données** : MongoDB managé (ou conteneur dédié avec volumes persistants)
- **DNS** : domaine `todos.mondomaine.fr` → Load Balancer (enregistrement A)
- **HTTPS** : certificat Let's Encrypt via Load Balancer ou Cloudflare
- **Secrets** : variables d'environnement Scaleway (JWT_SECRET, MONGO_URI) — jamais dans le code

#### Déploiement réalisé — Render + MongoDB Atlas

Un guide complet est disponible dans [`DEPLOY.md`](DEPLOY.md).

Fichier `render.yaml` à la racine : Blueprint Render (backend Web Service + frontend Static Site).

**Architecture de production :**

```
Frontend (Render)  →  Backend (Render)  →  MongoDB Atlas
```

**Commandes rapides :**

1. Créer MongoDB Atlas (cluster M0 gratuit)
2. Pousser le code sur GitHub
3. Render Dashboard → **New Blueprint** → connecter le repo
4. Renseigner `MONGO_URI` et `REACT_APP_API_URL`
5. Mettre à jour `CORS_ORIGIN` avec l'URL du frontend

---

Bon courage !
