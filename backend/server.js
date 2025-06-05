const express = require("express");
const routes = require("./routes");
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());

app.use('/api', routes);

mongoose.connect("mongodb://mongodb:27017/piscord")

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});