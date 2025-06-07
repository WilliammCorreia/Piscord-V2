require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes");
const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        process.env.FRONTEND_ADDRESS,
        process.env.INSOMNIA_ADDRESS
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', routes);

mongoose.connect(process.env.MONGODB_URI);

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
});