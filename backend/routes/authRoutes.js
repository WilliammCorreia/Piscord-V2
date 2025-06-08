const express = require("express");
const { validateSignup, validateSignin  } = require("../validators/userValidator");
const { handleValidationErrors } =  require("../middleware/validationHandlers");
const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.post("/signup", validateSignup, handleValidationErrors, AuthController.signup);
router.post("/signin", validateSignin, handleValidationErrors, AuthController.signin);
router.get("/refresh", AuthController.refresh);
router.get("/disconnect", AuthController.disconnect);

module.exports = router;