const express = require("express");
const authMiddleware = require("../middleware/authHandlers");
const MessageController = require("../controllers/MessageController");

const router = express.Router();

router.post("/", authMiddleware.handleAuthErrors, MessageController.create);
router.get("/reference/:referenceId", authMiddleware.handleAuthErrors, MessageController.getMessagesByReference);
router.delete("/soft/:messageId", authMiddleware.handleAuthErrors, MessageController.deleteMessage);

module.exports = router;