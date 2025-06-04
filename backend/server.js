const express = require("express");
const mongoose = require('mongoose');
const UserRepository = require("./repositories/UserRepository");
const app = express();
const port = 3000;

mongoose.connect("mongodb://mongodb:27017/piscord")
app.use(express.json());

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/signup", async (req, res) => {
    const { email, password, username } = req.body;

    UserRepository.create({ email, password, username });

    res.json("Utilisateur créé !");
});