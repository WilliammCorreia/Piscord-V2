const express = require("express");
const authRoutes = require("./authRoutes");
const serverRoutes = require("./serverRoutes");
const channelRoutes = require("./channelRoutes");
const messageRoutes = require("./messageRoutes");
const invitationRoutes = require("./invitationRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/server", serverRoutes);
router.use("/channel", channelRoutes);
router.use("/message", messageRoutes);
router.use("/invitation", invitationRoutes);

module.exports = router;