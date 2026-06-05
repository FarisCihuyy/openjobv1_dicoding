const express = require("express");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const DocumentController = require("../controllers/document.controller");

const router = express.Router();

router.get("/", DocumentController.getAll);
router.get("/:id", DocumentController.getById);

router.post("/", auth, upload.single("document"), DocumentController.upload);
router.delete("/:id", auth, DocumentController.remove);

module.exports = router;
