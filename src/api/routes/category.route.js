const express = require("express");
const CategoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);

router.post("/", authMiddleware, CategoryController.create);
router.put("/:id", authMiddleware, CategoryController.update);
router.delete("/:id", authMiddleware, CategoryController.remove);

module.exports = router;
