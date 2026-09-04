#!/usr/bin/env bash
set -euo pipefail

echo "==> 1/4 Installation des dépendances"
(cd backend && npm install)
(cd frontend && npm install)

echo "==> 2/4 Exécution des tests frontend"
(cd frontend && CI=true npm test -- --watchAll=false --passWithNoTests)

echo "==> 3/4 Construction des images Docker"
docker compose build

echo "==> 4/4 Déploiement local"
docker compose up -d

echo ""
echo "Application disponible :"
echo "  Frontend : http://localhost:3000"
echo "  Backend  : http://localhost:5000"
echo "  Health   : http://localhost:5000/api/health"
echo ""
echo "Pour pousser vers un registre (Docker Hub, etc.) :"
echo "  docker tag exam_practice_app_clean-backend  <user>/exam-backend:latest"
echo "  docker push <user>/exam-backend:latest"
