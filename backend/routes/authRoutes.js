const express = require("express");
const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.get("/test", AuthController.test)
router.post("/signup", AuthController.signup);

module.exports = router;