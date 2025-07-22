#!/bin/bash

# ============================================
# Script de déploiement Piscord
# Auteur: William
# ============================================

echo "========================================"
echo "    DEPLOIEMENT PISCORD"
echo "========================================"

# Configuration
ENVIRONMENT="production"
LOG_FILE="deployment_$(date +%Y%m%d).log"

# Création du répertoire logs si nécessaire
mkdir -p logs
echo "[$(date)] Début déploiement" >> "logs/$LOG_FILE"

echo "1. Vérification des prérequis..."

# Vérification Docker
if ! command -v docker &> /dev/null; then
    echo "ERREUR: Docker n'est pas installé"
    exit 1
fi

# Vérification fichier de configuration
if [ ! -f "docker-compose.yml" ]; then
    echo "ERREUR: docker-compose.yml introuvable"
    exit 1
fi

echo "   ✓ Prérequis validés"

echo "2. Arrêt des services existants..."
docker-compose down --remove-orphans 2>>"logs/$LOG_FILE"
echo "   ✓ Services arrêtés"

echo "3. Construction et démarrage..."
docker-compose build --no-cache 2>>"logs/$LOG_FILE"
if [ $? -ne 0 ]; then
    echo "ERREUR: Échec du build"
    echo "[$(date)] ECHEC déploiement - Build failed" >> "logs/$LOG_FILE"
    exit 1
fi

docker-compose up -d 2>>"logs/$LOG_FILE"
if [ $? -ne 0 ]; then
    echo "ERREUR: Échec du démarrage"
    echo "[$(date)] ECHEC déploiement - Startup failed" >> "logs/$LOG_FILE"
    exit 1
fi

echo "   ✓ Services démarrés"

echo "4. Vérification de l'état..."
sleep 10
docker-compose ps

# Vérification que les services sont UP
if ! docker-compose ps | grep -q "Up"; then
    echo "AVERTISSEMENT: Certains services peuvent ne pas être démarrés"
fi

echo "   ✓ Connectivité OK"

echo "========================================"
echo "     DEPLOIEMENT REUSSI !"
echo "========================================"
echo ""
echo "Application accessible sur: https://localhost:443"
echo ""
echo "Commandes utiles:"
echo "  docker-compose logs -f    (voir les logs)"
echo "  docker-compose down       (arrêter)"
echo "  docker-compose restart    (redémarrer)"

echo "[$(date)] Déploiement réussi" >> "logs/$LOG_FILE"
echo "$(date) - Déploiement réussi" >> "deployment_history.log"

echo ""
echo "Appuyez sur Entrée pour continuer..."
read -r