const express = require("express");
const AuthMiddleware = require("../middleware/authHandlers");
const InvitationController = require("../controllers/InvitationController");

const router = express.Router();

router.post("/", AuthMiddleware.handleAuthErrors, InvitationController.create);
router.get("/server/:serverId", AuthMiddleware.handleAuthErrors, InvitationController.getByServerId);
router.delete("/", AuthMiddleware.handleAuthErrors, InvitationController.delete);
router.post("/join", AuthMiddleware.handleAuthErrors, InvitationController.join);

module.exports = router;