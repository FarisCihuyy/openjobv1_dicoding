const pool = require("../../database/pool");
const response = require("../../utils/response");
const {
  InvariantError,
  NotFoundError,
  AuthenticationError,
} = require("../../exceptions");
const categorySchema = require("../validations/category.validation");
const { generateId } = require("../../utils");

const CategoryController = {
  async getAll(req, res, next) {
    try {
      const result = await pool.query(
        "SELECT id, name, created_at, updated_at FROM categories ORDER BY created_at DESC",
      );

      return response(res, 200, "Categories retrieved", {
        categories: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "SELECT id, name, created_at, updated_at FROM categories WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError(`Category does not exist`));
      }

      return response(res, 200, "Category retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = categorySchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      // Cek nama kategori sudah ada
      const existing = await pool.query(
        "SELECT id FROM categories WHERE name = $1",
        [value.name],
      );

      if (existing.rows.length > 0) {
        return next(
          new InvariantError(`Category "${value.name}" already exists`),
        );
      }

      const id = generateId();

      const result = await pool.query(
        `INSERT INTO categories (id, name)
         VALUES ($1, $2)
         RETURNING id, name`,
        [id, value.name],
      );

      return response(res, 201, "Category created", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;

      const { error, value } = categorySchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const existing = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError(`Category with id ${id} not found`));
      }

      const nameTaken = await pool.query(
        "SELECT id FROM categories WHERE name = $1 AND id != $2",
        [value.name, id],
      );

      if (nameTaken.rows.length > 0) {
        return next(
          new InvariantError(`Category "${value.name}" already exists`),
        );
      }

      const result = await pool.query(
        `UPDATE categories
         SET name = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, name`,
        [value.name, id],
      );

      return response(res, 200, "Category updated", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError("Category not found"));
      }

      await pool.query("DELETE FROM categories WHERE id = $1", [id]);

      return response(res, 200, "Category deleted", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CategoryController;
