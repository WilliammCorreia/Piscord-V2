const express = require("express");
const authRoutes = require("./authRoutes");
const serverRoutes = require("./serverRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/server", serverRoutes);

module.exports = router;