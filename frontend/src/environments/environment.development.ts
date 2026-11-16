export const environment = {
    // Vide : l'API et Socket.io sont appelés sur l'origine de la page.
    // Avec Docker, nginx route /api et /socket.io ; avec `ng serve` seul, c'est proxy.conf.json.
    BACKEND_ADDRESS: "",

    // Salons vocaux (WebRTC) : serveurs qui aident deux navigateurs à trouver un chemin direct.
    // Un serveur STUN public suffit sur la plupart des réseaux ; derrière un NAT strict,
    // il faudra y ajouter un serveur TURN.
    ICE_SERVERS: [{ urls: "stun:stun.l.google.com:19302" }] as RTCIceServer[]
};
