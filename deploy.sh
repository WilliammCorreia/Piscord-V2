#!/bin/bash
echo "Déploiement de Piscord"

# Build frontend
echo "Build du frontend..."
cd frontend && npm run build:prod

# Test du backend
echo "Test du backend..."
cd ../backend && npm test

# Démarrage des services
echo "Démarrage avec Docker..."
docker-compose up -d

echo "Déploiement terminé !"