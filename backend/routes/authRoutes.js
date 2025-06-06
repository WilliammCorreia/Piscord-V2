const express = require("express");
const { validateSignup } = require("../validators/userValidator");
const { handleValidationErrors } =  require("../middleware/validationHandlers");
const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.post("/signup", validateSignup, handleValidationErrors, AuthController.signup);

module.exports = router;