export const environment = {
    // Vide : l'API et Socket.io sont appelés sur l'origine de la page.
    // Avec Docker, nginx route /api et /socket.io ; avec `ng serve` seul, c'est proxy.conf.json.
    BACKEND_ADDRESS: ""
};
