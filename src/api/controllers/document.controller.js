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
        `SELECT id, user_id, file_name, file_url, created_at, updated_at
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

  // GET /documents/:id — Get document by ID (protected)
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "SELECT id, user_id, file_name, file_url, created_at, updated_at FROM documents WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError("Document not found"));
      }

      return response(res, 200, "Document retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // POST /documents — Upload document (protected, multipart/form-data)
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return next(new InvariantError("required"));
      }

      const userId = req.user.id;
      const id = generateId();
      const file_name = req.file.originalname;
      const file_url = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `INSERT INTO documents (id, user_id, file_name, file_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, user_id, file_name, file_url, created_at, updated_at`,
        [id, userId, file_name, file_url],
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
