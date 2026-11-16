export const environment = {
    // Vide : l'API et Socket.io sont appelés sur l'origine de la page, via le reverse proxy
    // (/api et /socket.io). Ne renseigner une adresse que si le backend est sur un autre domaine.
    BACKEND_ADDRESS: "",

    // Salons vocaux (WebRTC) : serveurs qui aident deux navigateurs à trouver un chemin direct.
    // Un serveur STUN public suffit sur la plupart des réseaux ; derrière un NAT strict,
    // il faudra y ajouter un serveur TURN.
    ICE_SERVERS: [{ urls: "stun:stun.l.google.com:19302" }] as RTCIceServer[]
};
