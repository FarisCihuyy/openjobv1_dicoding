const express = require("express");
const authMiddleware = require("../middlewares/auth");
const ProfileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/", authMiddleware, ProfileController.getProfile);
router.get(
  "/applications",
  authMiddleware,
  ProfileController.getMyApplications,
);
router.get("/bookmarks", authMiddleware, ProfileController.getMyBookmarks);

// router.post("/", authMiddleware, JobController.create);
// router.put("/:id", authMiddleware, JobController.update);
// router.delete("/:id", authMiddleware, JobController.remove);

// router.use("/:jobId/bookmark", jobBookmarkRouter);

module.exports = router;
