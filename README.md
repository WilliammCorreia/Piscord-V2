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

## Déploiement
Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour les instructions de déploiement complètes.

## 📁 Structure

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
├── docker-compose.yml    # Configuration Docker
├── deploy.bat            # Script déploiement Windows
├── deploy.sh             # Script déploiement Unix
└── package.json          # Scripts npm
```

---

**Auteur**: William