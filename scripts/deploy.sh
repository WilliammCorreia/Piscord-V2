#!/bin/sh
# Mise en production, exécutée sur le serveur par la chaîne de déploiement
# (.github/workflows/deploy.yml), dans le dossier qui contient docker-compose.yml et .env.
#
# Le jeton du registre d'images est lu sur l'entrée standard : il ne passe ni par la ligne
# de commande, ni par un fichier qui resterait sur le serveur.
#
#   REGISTRY=ghcr.io REGISTRY_USER=<compte> sh deploy.sh < jeton
set -eu

compose="docker compose -f docker-compose.yml"

# Lit une valeur du fichier .env
setting() {
    sed -n "s/^$1=//p" .env | tail -n 1 | tr -d "\"'"
}

for file in docker-compose.yml config.conf .env backend/.env; do
    if [ ! -f "$file" ]; then
        echo "Fichier manquant sur le serveur : $(pwd)/$file" >&2
        exit 1
    fi
done

backend_image=$(setting BACKEND_IMAGE)
frontend_image=$(setting FRONTEND_IMAGE)
if [ -z "$backend_image" ] || [ -z "$frontend_image" ]; then
    echo "BACKEND_IMAGE et FRONTEND_IMAGE doivent être renseignées dans $(pwd)/.env" >&2
    exit 1
fi

# Connexion au registre dans un dossier temporaire, effacé à la fin : les identifiants Docker
# déjà présents sur le serveur ne sont ni modifiés ni complétés.
registry_config=$(mktemp -d)
trap 'rm -rf "$registry_config"' EXIT
docker --config "$registry_config" login "$REGISTRY" --username "$REGISTRY_USER" --password-stdin

# Les images sont téléchargées avant de toucher à quoi que ce soit : si l'une manque,
# le script s'arrête ici et la version en place continue de tourner.
docker --config "$registry_config" pull "$backend_image"
docker --config "$registry_config" pull "$frontend_image"

$compose up -d --no-build --remove-orphans

# config.conf est monté dans le conteneur nginx, qui ne relit pas le fichier tout seul
$compose up -d --no-build --no-deps --force-recreate reverseproxy

# Le déploiement n'est réussi que si l'application répond
attempt=0
until $compose exec -T reverseproxy wget -q -O /dev/null http://127.0.0.1/api/ping; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo "L'application ne répond pas après le déploiement." >&2
        $compose ps
        $compose logs --tail 40 backend reverseproxy
        exit 1
    fi
    sleep 2
done

echo "Piscord est en ligne."

# Les images que cette mise à jour vient de remplacer n'ont plus de nom : on libère la place.
# Le filtre limite le ménage aux images de Piscord, sans toucher aux autres applications.
docker image prune -f --filter label=app=piscord
