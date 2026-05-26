const express = require("express");
const JobController = require("../controllers/job.controller");
const authMiddleware = require("../middlewares/auth");
const { jobBookmarkRouter } = require("./bookmark.route");

const router = express.Router();

router.get("/company/:companyId", JobController.getByCompany);
router.get("/category/:categoryId", JobController.getByCategory);
router.get("/:id", JobController.getById);
router.get("/", JobController.getAll);

router.post("/", authMiddleware, JobController.create);
router.put("/:id", authMiddleware, JobController.update);
router.delete("/:id", authMiddleware, JobController.remove);

router.use("/:jobId/bookmark", jobBookmarkRouter);

module.exports = router;
