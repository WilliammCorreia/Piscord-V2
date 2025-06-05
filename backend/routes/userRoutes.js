const express = require("express");
const UserController = require("../controllers/UserController");

const router = express.Router();

router.get("/signup", UserController.createUser);

module.exports = router;