const express = require("express");
const AuthMiddleware = require("../middleware/authHandlers");
const ChannelController = require("../controllers/ChannelController");

const router = express.Router();

router.post("/", AuthMiddleware.handleAuthErrors, ChannelController.create);
router.get("/server/:serverId", AuthMiddleware.handleAuthErrors, ChannelController.getByServerId);

module.exports = router;