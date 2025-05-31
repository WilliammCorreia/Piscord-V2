# Piscord - Chat en Temps Réel

Application de chat en temps réel inspirée de Discord, développée avec Node.js et Angular.

## 🚀 Fonctionnalités

- ✅ Inscription/Connexion sécurisée
- ✅ Création et gestion de serveurs
- ✅ Messages en temps réel
- ✅ Indicateur "en train d'écrire"
- ✅ Liste des membres connectés

## 🛠️ Technologies

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT pour l'authentification

**Frontend**
- Angular
- Socket.io-client
- SCSS

## 📋 Prérequis

- Node.js (v16+)
- MongoDB
- Angular CLI

## ⚡ Installation Rapide

### Backend
```bash
cd backend
npm install
```

Créer un fichier `.env` :
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/piscord
JWT_SECRET=votre-secret-key
```

Lancer le serveur :
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

L'application sera accessible sur `http://localhost:4200`

## 📁 Structure Simplifiée

```
piscord/
├── backend/
│   ├── models/         # Modèles MongoDB
│   ├── routes/         # Routes API
│   ├── middleware/     # Auth middleware
│   ├── .env           # Variables d'environnement
│   └── server.js      # Serveur principal
│
└── frontend/
    └── src/
        └── app/
            ├── components/     # Components Angular
            ├── services/       # Services (API, Socket)
            └── app.module.ts   # Module principal
```

## 🔌 API Principales

### Auth
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

### Serveurs
- `GET /servers` - Liste des serveurs
- `POST /servers` - Créer un serveur
- `POST /servers/join` - Rejoindre avec code

### Socket.io Events
- `message` - Envoyer un message
- `new-message` - Recevoir un message
- `typing` - Indicateur de frappe
- `join-server` - Rejoindre un serveur

## 🚀 Déploiement

**Backend**: Render.com
**Frontend**: Vercel
**Base de données**: MongoDB Atlas

---

**Auteur**: William