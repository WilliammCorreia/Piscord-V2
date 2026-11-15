# Piscord - Chat en Temps Réel

Application de chat en temps réel inspirée de Discord, développée avec Node.js et Angular.

## 🚀 Fonctionnalités

- ✅ Inscription/Connexion sécurisée
- ✅ Création et gestion de serveurs, salons et invitations
- ✅ Messages en temps réel, avec historique paginé
- ✅ Indicateur "en train d'écrire"
- ✅ Liste des membres du serveur

## 🛠️ Technologies

**Backend**
- Node.js 24 + Express 5, en TypeScript
- MongoDB + Mongoose
- Socket.io
- JWT en cookies httpOnly pour l'authentification

**Frontend**
- Angular 22 (composants standalone)
- Socket.io-client
- SCSS

**Infrastructure**
- Docker Compose, nginx en reverse proxy

## 📋 Prérequis

- Docker et Docker Compose
- Pour travailler hors Docker : Node.js 24.15 ou plus récent

## ⚡ Lancement avec Docker

Créer `backend/.env` à partir de l'exemple, puis renseigner `JWT_SECRET` :

```bash
cp backend/.env.example backend/.env
```

Lancer l'environnement de développement (rechargement à chaud du backend et du frontend) :

```bash
docker compose up --build
```

L'application est accessible sur `http://localhost`. Le reverse proxy sert le frontend et
route `/api` et `/socket.io` vers le backend : tout est sur la même origine.

Après un changement de dépendances (`package.json`), recréer les volumes `node_modules` :

```bash
docker compose up --build --renew-anon-volumes
```

Lancer la configuration de production (images compilées, seul le port 80 est exposé) :

```bash
docker compose -f docker-compose.yml up --build
```

## 🧪 Tests

Backend — tests d'intégration (API, contrôle d'accès, Socket.io) sur un MongoDB en mémoire :

```bash
npm --prefix backend install
npm --prefix backend test
```

Frontend — tests unitaires (Vitest) :

```bash
npm --prefix frontend install
npm --prefix frontend test -- --watch=false
```

## 💻 Lancement sans Docker

Le backend a besoin d'un MongoDB joignable par `MONGODB_URI`.

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend start
```

`ng serve` relaie `/api` et `/socket.io` vers `http://localhost:3000` (voir `frontend/proxy.conf.json`).
L'application est alors accessible sur `http://localhost:4200`.

## 🔐 Variables d'environnement (backend)

| Variable | Rôle |
| --- | --- |
| `PORT` | Port d'écoute (3000 par défaut) |
| `MONGODB_URI` | Adresse de la base MongoDB |
| `JWT_SECRET` | Secret de signature des tokens (32 caractères aléatoires minimum) |
| `JWT_REFRESH_SECRET` | Secret dédié aux refresh tokens (optionnel) |
| `CORS_ORIGINS` | Origines autorisées en cross-origin, séparées par des virgules (inutile derrière le reverse proxy) |
| `COOKIE_SECURE` | `true` dès que le site est servi en HTTPS |

## 📁 Structure

```
piscord/
├── backend/
│    ├── src/
│    │    ├── routes/           # Routes
│    │    ├── controllers/      # Contrôleurs
│    │    ├── services/         # Services métier (dont AccessService : contrôle d'appartenance)
│    │    ├── repositories/     # Accès aux données
│    │    ├── models/           # Schémas MongoDB
│    │    ├── validators/       # Validation des données
│    │    ├── middleware/       # Authentification, validation, erreurs, rate limiting
│    │    ├── socket/           # Socket.io (authentification, salons, diffusion)
│    │    ├── app.ts            # Application Express
│    │    └── server.ts         # Point d'entrée
│    └── tests/                 # Tests d'intégration
│
├── frontend/
│    └── src/
│         └── app/
│              ├── core/        # Guards, intercepteur HTTP, modèles communs
│              └── features/    # auth, home, server, settings (chargées à la demande)
│
├── config.conf                 # Reverse proxy nginx
├── docker-compose.yml          # Production
└── docker-compose.override.yml # Ajouts pour le développement
```

---

**Auteur**: William
