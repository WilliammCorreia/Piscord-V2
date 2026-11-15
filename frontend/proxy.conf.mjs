// Relaie /api et /socket.io du serveur de dev Angular vers le backend.
// Hors Docker, le backend écoute sur localhost:3000. Dans Docker, docker-compose.override.yml
// fournit BACKEND_URL pour viser le conteneur backend.
const target = process.env.BACKEND_URL ?? 'http://localhost:3000';

export default {
  '/api': { target, secure: false },
  '/socket.io': { target, secure: false, ws: true },
};
