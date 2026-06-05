const path = require("path");
const fs = require("fs");
const pool = require("../../database/pool");
const response = require("../../utils/response");
const { InvariantError, NotFoundError } = require("../../exceptions");
const { generateId } = require("../../utils");

const DocumentController = {
  async getAll(req, res, next) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, original_name, file_url, size, created_at, updated_at
         FROM documents
         ORDER BY created_at DESC`,
      );

      return response(res, 200, "Documents retrieved", {
        documents: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "SELECT file_name, original_name FROM documents WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError("Document not found"));
      }

      const file = result.rows[0];

      const filePath = path.join(__dirname, "../../uploads", file.file_name);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.original_name}"`,
      );

      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  },

  // POST /documents — Upload document (protected, multipart/form-data)
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return next(new InvariantError("File is required"));
      }

      const userId = req.user.id;
      const id = generateId();
      const originalName = req.file.originalname;
      const file_name = req.file.filename;
      const file_url = `/uploads/${req.file.filename}`;
      const size = req.file.size;

      const result = await pool.query(
        `INSERT INTO documents (id, user_id, original_name, file_name, file_url, size, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id AS "documentId", user_id, original_name AS "originalName", file_name AS "filename", file_url, size, created_at, updated_at`,
        [id, userId, originalName, file_name, file_url, size],
      );

      return response(res, 201, "Document uploaded", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /documents/:id — Delete document (protected)
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existing = await pool.query(
        "SELECT id, user_id, file_url FROM documents WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError("Document not found"));
      }

      // Hanya pemilik dokumen yang bisa hapus
      if (existing.rows[0].user_id !== userId) {
        return next(
          new AuthorizationError("You are not allowed to delete this document"),
        );
      }

      // Hapus file fisik dari disk
      const filePath = path.join(process.cwd(), existing.rows[0].file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await pool.query("DELETE FROM documents WHERE id = $1", [id]);

      return response(res, 200, "Document deleted", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = DocumentController;
