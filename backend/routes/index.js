const express = require("express");
const authRoutes = require("./authRoutes");
const serverRoutes = require("./serverRoutes");
const channelRoutes = require("./channelRoutes");
const messageRoutes = require("./messageRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/server", serverRoutes);
router.use("/channel", channelRoutes);
router.use("/message", messageRoutes);

module.exports = router;