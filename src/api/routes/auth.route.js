const express = require("express");
const AuthenticationController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/", AuthenticationController.login);

router.put("/", authMiddleware, AuthenticationController.refresh);

router.delete("/", authMiddleware, AuthenticationController.logout);

module.exports = router;
