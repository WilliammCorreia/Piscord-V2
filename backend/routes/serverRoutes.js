const express = require("express");
const AuthMiddleware = require("../middleware/authHandlers");
const ServerController = require("../controllers/ServerController");

const router = express.Router();

router.post('/create', AuthMiddleware.handleAuthErrors, ServerController.create);
router.get('/userServers', ServerController.getUserServers);

module.exports = router;