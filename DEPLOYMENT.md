# Guide de déploiement - Piscord

## Architecture
- Frontend : Angular (port 80)
- Backend : Node.js/Express (port 3000) 
- Base de données : MongoDB (port 27017)

## Prérequis

### Pour le déploiement avec Docker (recommandé)
- Docker et Docker Compose

### Pour le développement local
- Node.js >= 22
- MongoDB (si pas d'utilisation de Docker)

## Installation Rapide

### 1. Configuration

Créer un fichier `.env` à la racine du projet :
```
MONGO_ROOT_PASSWORD=votre-mot-de-passe
JWT_SECRET=votre-secret-key
```

### 2. Déploiement

```bash
# Avec npm (Windows)
npm run deploy

# Avec npm (Linux & macOS)
npm run deploy:unix

# Ou manuellement avec Docker
docker-compose up -d --build
```

### 3. Déploiement avec les scripts

#### Windows
```bash
deploy.bat
```

#### Linux/macOS
```bash
# Rendre le script exécutable (première fois uniquement)
chmod +x deploy.sh

# Lancer le déploiement
./deploy.sh
```

## Vérification

L'application sera accessible sur :
- **Frontend** : http://localhost
- **Backend API** : http://localhost:3000

Test rapide :
```bash
# Tester le backend
curl http://localhost:3000/

# Voir les logs
docker-compose logs
```

## Gestion des services

```bash
# Voir le statut
npm run status

# Consulter les logs
npm run logs

# Arrêter les services
npm run stop

# Redémarrer
npm run restart
```

Ou directement avec Docker :
```bash
# Voir le statut
docker-compose ps

# Consulter les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Redémarrer
docker-compose restart
```

## Logs et débogage

Les scripts de déploiement créent automatiquement des logs :
- **Logs de déploiement** : `logs/deployment_YYYYMMDD.log`
- **Historique** : `deployment_history.log`

```bash
# Voir les logs de déploiement du jour
cat logs/deployment_$(date +%Y%m%d).log

# Voir l'historique complet
cat deployment_history.log
```

## Structure

```
piscord/
├── backend/
│    ├── controllers/      # Contrôleurs
│    ├── services/         # Services métier
│    ├── repositories/     # Accès aux données
│    ├── models/           # Schémas MongoDB
│    ├── validators/       # Validation des données
│    ├── middleware/       # Middlewares transversaux
│    ├── routes/           # Routes
│    └── server.js         # Point d'entrée
│
├── frontend/
│    └── src/
│        └── app/
│            ├── features/      # Modules fonctionnels
│            │   ├── auth/      # Authentification
│            │   ├── home/      # Accueil et profil
│            │   ├── server/    # Serveurs et chat
│            │   └── settings/  # Réglages du serveur
│            ├── app.component.ts
│            └── app-module.ts
│
├── logs/                 # Logs de déploiement (créé automatiquement)
├── docker-compose.yml    # Configuration Docker
├── deploy.bat            # Script déploiement Windows
├── deploy.sh             # Script déploiement Unix
├── deployment_history.log # Historique des déploiements
└── package.json          # Scripts npm
```

## Dépannage

### Problèmes courants

1. **Erreur "Permission denied"** sur Linux/macOS :
   ```bash
   chmod +x deploy.sh
   ```

2. **Ports déjà utilisés** :
   ```bash
   # Vérifier les ports
   netstat -tuln | grep :80
   netstat -tuln | grep :3000
   
   # Arrêter les services existants
   docker-compose down
   ```

3. **Problème de build Docker** :
   ```bash
   # Nettoyer le cache Docker
   docker system prune -f
   docker-compose build --no-cache
   ```

---

**Auteur**: William