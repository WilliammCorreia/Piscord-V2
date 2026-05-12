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

### Installation Rapide avec Docker (Recommandé)
- Docker
- Docker Compose

## ⚡ Installation Rapide

### 🐳 Avec Docker (Recommandé)

1. **Créer le fichier `.env` du backend** :
```bash
cat > backend/.env << 'EOF'
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/piscord
JWT_SECRET=votre-secret-key
FRONTEND_ADDRESS=http://localhost
INSOMNIA_ADDRESS=http://localhost
EOF
```

2. **Démarrer l'application** :
```bash
docker compose up --build -d
```

L'application sera accessible sur : http://localhost

3. **Arrêter l'application** :
```bash
docker compose down
```

---

**Auteur**: William