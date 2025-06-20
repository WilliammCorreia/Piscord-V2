const express = require("express");
const AuthMiddleware = require("../middleware/authHandlers");
const ServerController = require("../controllers/ServerController");

const router = express.Router();

router.post('/', AuthMiddleware.handleAuthErrors, ServerController.create);
router.get('/user', AuthMiddleware.handleAuthErrors, ServerController.getByUserId);

module.exports = router;