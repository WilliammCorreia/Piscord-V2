require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const routes = require("./routes");

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        process.env.REVERSE_PROXY_ADDRESS
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', routes);

mongoose.connect(process.env.MONGODB_URI);

const server = app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});


app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_ADDRESS,
            process.env.INSOMNIA_ADDRESS
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Nouvel utilisateur connecté:", socket.id);

    socket.on("message", (message) => {
        socket.broadcast.to(message.referenceId).emit("message", message);
        console.log("à envoyer le message:", message.content);
    });

    socket.on("join-channel", (channelId) => {
        socket.join(channelId);
        console.log("à rejoint la room:", channelId);
    });

    socket.on('leave-channel', (channelId) => {
        socket.leave(channelId);
        console.log("à quitté la room:", channelId);
    });

    socket.on("typing", (data) => {
        socket.broadcast.to(data.channelId).emit("typing", {
            username: data.username,
            channelId: data.channelId
        });
    });

    socket.on("disconnect", () => {
        console.log("Utilisateur déconnecté:", socket.id);
    });
})