@echo off
echo === Deploiement de Piscord ===

echo 1. Arret des services existants...
docker-compose down

echo 2. Build et demarrage des services...
docker-compose up -d --build

echo 3. Verification de l'etat...
ping 127.0.0.1 -n 11 > nul
docker-compose ps

echo === Deploiement termine ! ===
echo Application accessible sur http://localhost
pause