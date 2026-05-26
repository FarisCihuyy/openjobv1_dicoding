const express = require("express");
const authMiddleware = require("../middlewares/auth");
const BookmarkController = require("../controllers/bookmark.controller");

const bookmarksRouter = express.Router();
bookmarksRouter.get("/", authMiddleware, BookmarkController.getMyBookmarks);

const jobBookmarkRouter = express.Router({ mergeParams: true });
jobBookmarkRouter.post("/", authMiddleware, BookmarkController.create);
jobBookmarkRouter.get("/:id", authMiddleware, BookmarkController.getById);
jobBookmarkRouter.delete("/", authMiddleware, BookmarkController.remove);

module.exports = { bookmarksRouter, jobBookmarkRouter };
