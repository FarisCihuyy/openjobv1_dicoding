const pool = require("../../database/pool");
const response = require("../../utils/response");
const {
  InvariantError,
  NotFoundError,
  AuthenticationError,
} = require("../../exceptions");
const { generateId } = require("../../utils");
const companySchema = require("../validations/company.validation");

const CompanyController = {
  async getAll(req, res, next) {
    try {
      const result = await pool.query(
        `SELECT id, name, description, location
         FROM companies
         ORDER BY created_at DESC`,
      );

      return response(res, 200, "Companies retrieved", {
        companies: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT id, name, description, location
         FROM companies
         WHERE id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError("Company not found"));
      }

      return response(res, 200, "Company retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = companySchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const id = generateId();
      const userId = req.user.id;

      const result = await pool.query(
        `INSERT INTO companies (id, name, description, location)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, location`,
        [id, value.name, value.description, value.location],
      );

      return response(res, 201, "Company created", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError("Company not found"));
      }

      const { error, value } = companySchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const result = await pool.query(
        `UPDATE companies
         SET name = $1, description = $2, location = $3
         WHERE id = $4
         RETURNING id, name, description, location`,
        [value.name, value.description, value.location, id],
      );

      return response(res, 200, "Company updated", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError("Company not found"));
      }

      await pool.query("DELETE FROM companies WHERE id = $1", [id]);

      return response(res, 200, "Company deleted", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CompanyController;
