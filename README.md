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

- Node.js
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
FRONTEND_ADDRESS=http://localhost:4200
INSOMNIA_ADDRESS=http://localhost:8005
```

Lancer le serveur :
```bash
node server.js
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

L'application sera accessible sur `http://localhost:4200`

## 📁 Structure

```
piscord/
├── backend/
│    ├── routes/           # Routes
│    ├── controllers/      # Contrôleurs
│    ├── services/         # Services métier
│    ├── repositories/     # Accès aux données
│    ├── models/           # Schémas MongoDB
│    ├── validators/       # Validation des données
│    ├── middleware/       # Middlewares transversaux
│    └── server.js         # Point d'entrée
│
└── frontend/
    └── src/
        └── app/
            ├── components/     # Components Angular
            ├── services/       # Services (API, Socket)
            └── app.module.ts   # Module principal
```

---

**Auteur**: William