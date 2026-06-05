const pool = require("../../database/pool");
const response = require("../../utils/response");
const {
  InvariantError,
  NotFoundError,
  AuthenticationError,
} = require("../../exceptions");
const { generateId } = require("../../utils");
const companySchema = require("../validations/company.validation");
const cache = require("../../utils/cache");

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
      const cacheKey = `companies:${id}`;

      const cached = await cache.get(cacheKey);
      if (cached) {
        return response(res, 200, "Companies retrieved", cached);
      }

      const result = await pool.query(`SELECT * FROM companies WHERE id = $1`, [
        id,
      ]);

      if (result.rows.length === 0) {
        return next(new NotFoundError(`Company with id ${id} not found`));
      }

      await cache.set(cacheKey, result.rows[0]);
      return response(res, 200, "Companies retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = companySchema.validate(req.body);
      if (error) return next(new InvariantError(error.details[0].message));

      const id = generateId("company");

      const result = await pool.query(
        `INSERT INTO companies (id, name, description, location)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, location, created_at, updated_at`,
        [id, value.name, value.description || null, value.location || null],
      );

      await cache.del(`companies:${id}`);
      return response(res, 201, "Company created", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = companySchema.validate(req.body);
      if (error) return next(new InvariantError(error.details[0].message));

      const existing = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [id],
      );
      if (existing.rows.length === 0) {
        return next(new NotFoundError(`Company with id ${id} not found`));
      }

      const result = await pool.query(
        `UPDATE companies
         SET name = $1, description = $2, location = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, description, location, created_at, updated_at`,
        [value.name, value.description || null, value.location || null, id],
      );

      await cache.del(`companies:${id}`);
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
        return next(new NotFoundError(`Company with id ${id} not found`));
      }

      await pool.query("DELETE FROM companies WHERE id = $1", [id]);
      await cache.del(`companies:${id}`);
      return response(res, 200, "Company deleted", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CompanyController;
