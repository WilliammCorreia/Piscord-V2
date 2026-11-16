# Piscord - Chat en Temps Réel

Application de chat en temps réel inspirée de Discord, développée avec Node.js et Angular.

## 🚀 Fonctionnalités

- ✅ Inscription/Connexion sécurisée
- ✅ Création et gestion de serveurs, salons et invitations
- ✅ Messages en temps réel, avec historique paginé
- ✅ Indicateur "en train d'écrire"
- ✅ Statut de connexion : pastille verte sur les membres et les amis connectés
- ✅ Amis (demande par pseudo ou depuis un serveur) et messages privés
- ✅ Salons vocaux (WebRTC, pair-à-pair)
- ✅ Interface pensée mobile d'abord, installable comme application (PWA)

## 🛠️ Technologies

**Backend**
- Node.js 24 + Express 5, en TypeScript
- MongoDB + Mongoose
- Socket.io
- JWT en cookies httpOnly pour l'authentification

**Frontend**
- Angular 22 (composants standalone), service worker Angular pour le mode PWA
- Socket.io-client, WebRTC pour le vocal
- SCSS, mobile first

**Infrastructure**
- Docker Compose, nginx en reverse proxy

## 📋 Prérequis

- Docker et Docker Compose 2.24 ou plus récent
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

Essayer la configuration de production sur sa machine (images compilées, service worker actif) :

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

L'application est alors accessible sur `http://localhost:8088`.

## 🌍 Déploiement sur un serveur

En production, Piscord ne publie aucun port : il se place derrière le reverse proxy du serveur,
celui qui écoute sur les ports 80 et 443, porte les certificats HTTPS et répartit les domaines
entre les applications de la machine.

```
Internet ──► reverse proxy du serveur (HTTPS) ──► reverse proxy de Piscord ──► frontend / backend
```

Les deux reverse proxys se parlent sur un réseau Docker partagé, nommé `proxy` par défaut.
S'il n'existe pas encore, le créer et y rattacher le conteneur du reverse proxy du serveur :

```bash
docker network create proxy
```

Si ce réseau porte un autre nom, l'indiquer dans un fichier `.env` à la racine du dépôt :
`PROXY_NETWORK=nom-du-reseau`.

Lancer Piscord :

```bash
docker compose -f docker-compose.yml up -d --build
```

Il reste à dire au reverse proxy du serveur d'envoyer le domaine vers `http://piscord:80`,
en transmettant les en-têtes WebSocket (sans eux, le temps réel retombe sur du long-polling).

Avec Caddy, qui obtient le certificat et gère les WebSockets tout seul :

```
piscord.example.com {
    reverse_proxy piscord:80
}
```

Avec nginx :

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name piscord.example.com;

    ssl_certificate     /etc/letsencrypt/live/piscord.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/piscord.example.com/privkey.pem;

    # Résolution du nom à chaque requête (DNS interne de Docker) : nginx démarre même si Piscord
    # est arrêté, et suit son conteneur quand une mise à jour le recrée avec une autre adresse
    resolver 127.0.0.11 valid=10s;
    set $piscord http://piscord:80;

    location / {
        proxy_pass $piscord;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

Le backend est réglé pour cette chaîne à deux reverse proxys (`TRUST_PROXY_HOPS: "2"` dans
`docker-compose.yml`) : c'est ce qui lui permet de retrouver l'adresse réelle de chaque visiteur
pour limiter les tentatives de connexion. Si un proxy de plus s'intercale (Cloudflare, par exemple),
augmenter ce nombre d'autant.

## 📱 PWA et salons vocaux : HTTPS requis

Les navigateurs réservent le service worker (installation, ouverture hors ligne) et l'accès au
micro aux pages sécurisées : `https://`, ou `http://localhost` pour le développement.
Sur un serveur accessible en simple HTTP, l'application fonctionne mais ne peut être ni installée
ni utilisée pour le vocal.

- **PWA** : le service worker n'est actif que sur le build de production
  (voir « Essayer la configuration de production » plus haut), pas avec `ng serve`.
- **Vocal** : le son passe directement entre les navigateurs. Le serveur STUN public configuré dans
  `frontend/src/environments/` suffit sur la plupart des réseaux ; derrière un NAT strict il faut
  y ajouter un serveur TURN. Un salon accueille 8 participants au plus.
- **Statut de connexion** : il est tenu en mémoire par le backend, ce qui suppose une seule
  instance du backend.

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

`ng serve` relaie `/api` et `/socket.io` vers `http://localhost:3000` (voir `frontend/proxy.conf.mjs`).
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
| `TRUST_PROXY_HOPS` | Nombre de reverse proxys entre le visiteur et le backend (1 par défaut) |

Avec Docker Compose, `COOKIE_SECURE` et `TRUST_PROXY_HOPS` sont fixés par les fichiers
`docker-compose*.yml`, qui l'emportent sur `backend/.env`.

## 📁 Structure

```
piscord/
├── backend/
│    ├── src/
│    │    ├── routes/           # Routes
│    │    ├── controllers/      # Contrôleurs
│    │    ├── services/         # Services métier (accès, amis, présence, état des salons vocaux)
│    │    ├── repositories/     # Accès aux données
│    │    ├── models/           # Schémas MongoDB
│    │    ├── validators/       # Validation des données
│    │    ├── middleware/       # Authentification, validation, erreurs, rate limiting
│    │    ├── socket/           # Socket.io (authentification, présence, salons, signalisation vocale)
│    │    ├── app.ts            # Application Express
│    │    └── server.ts         # Point d'entrée
│    └── tests/                 # Tests d'intégration
│
├── frontend/
│    └── src/
│         └── app/
│              ├── core/        # Coque responsive, guards, intercepteur HTTP, présence
│              └── features/    # auth, home, friends, server, settings (chargées à la demande)
│
├── config.conf                 # Reverse proxy nginx de Piscord
├── docker-compose.yml          # Production, derrière le reverse proxy du serveur
├── docker-compose.override.yml # Ajouts pour le développement
└── docker-compose.local.yml    # Essai de la production sur sa machine
```

---

**Auteur**: William
