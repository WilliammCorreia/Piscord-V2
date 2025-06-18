const express = require("express");
const authRoutes = require("./authRoutes");
const serverRoutes = require("./serverRoutes");
const channelRoutes = require("./channelRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/server", serverRoutes);
router.use("/channel", channelRoutes);

module.exports = router;