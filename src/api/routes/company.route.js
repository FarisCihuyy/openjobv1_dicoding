const express = require("express");
const authMiddleware = require("../middlewares/auth");
const CompanyController = require("../controllers/company.controller");

const router = express.Router();

router.get("/", CompanyController.getAll);
router.get("/:id", CompanyController.getById);

router.post("/", authMiddleware, CompanyController.create);
router.put("/:id", authMiddleware, CompanyController.update);
router.delete("/:id", authMiddleware, CompanyController.remove);

module.exports = router;
