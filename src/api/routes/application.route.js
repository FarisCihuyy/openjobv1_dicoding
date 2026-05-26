const express = require("express");
const authMiddleware = require("../middlewares/auth");
const ApplicationController = require("../controllers/application.controller");

const router = express.Router();

router.get("/user/:userId", authMiddleware, ApplicationController.getByUser);
router.get("/job/:jobId", authMiddleware, ApplicationController.getByJob);
router.get("/:id", authMiddleware, ApplicationController.getById);
router.get("/", authMiddleware, ApplicationController.getAll);

router.post("/", authMiddleware, ApplicationController.create);
router.put("/:id", authMiddleware, ApplicationController.updateStatus);
router.delete("/:id", authMiddleware, ApplicationController.remove);

module.exports = router;
