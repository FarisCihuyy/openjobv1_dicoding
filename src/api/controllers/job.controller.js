const pool = require("../../database/pool");
const { NotFoundError, InvariantError } = require("../../exceptions");
const { generateId } = require("../../utils");
const response = require("../../utils/response");
const jobSchema = require("../validations/job.validation");

const JOB_SELECT = `
  j.id,
  j.title,
  j.description,
  j.job_type,
  j.experience_level,
  j.location_type,
  j.location_city,
  j.salary_min,
  j.salary_max,
  j.is_salary_visible,
  j.status,
  c.id          AS company_id,
  c.name        AS company_name,
  c.location    AS company_location,
  cat.id        AS category_id,
  cat.name      AS category_name
`;

const JOB_JOIN = `
  FROM jobs j
  JOIN companies c    ON j.company_id  = c.id
  JOIN categories cat ON j.category_id = cat.id
`;

const JobController = {
  async getAll(req, res, next) {
    try {
      const { title, "company-name": companyName } = req.query;

      const conditions = [];
      const params = [];

      if (title) {
        params.push(`%${title}%`);
        conditions.push(`j.title ILIKE $${params.length}`);
      }

      if (companyName) {
        params.push(`%${companyName}%`);
        conditions.push(`c.name ILIKE $${params.length}`);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const result = await pool.query(
        `SELECT ${JOB_SELECT} ${JOB_JOIN} ${whereClause} ORDER BY j.created_at DESC`,
        params,
      );

      return response(res, 200, "Jobs retrieved", { jobs: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT ${JOB_SELECT},
           c.description AS company_description
         ${JOB_JOIN}
         WHERE j.id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError(`Job not found`));
      }

      return response(res, 200, "Job retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async getByCompany(req, res, next) {
    try {
      const { companyId } = req.params;

      const company = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [companyId],
      );

      //   if (company.rows.length === 0) {
      //     return next(new NotFoundError(`Company not found`));
      //   }

      const result = await pool.query(
        `SELECT ${JOB_SELECT} ${JOB_JOIN} WHERE j.company_id = $1 ORDER BY j.created_at DESC`,
        [companyId],
      );

      return response(res, 200, "Jobs retrieved", { jobs: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async getByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;

      const category = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [categoryId],
      );

      //   if (category.rows.length === 0) {
      //     return next(new NotFoundError(`Category not found`));
      //   }

      const result = await pool.query(
        `SELECT ${JOB_SELECT} ${JOB_JOIN} WHERE j.category_id = $1 ORDER BY j.created_at DESC`,
        [categoryId],
      );

      return response(res, 200, "Jobs retrieved", { jobs: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = jobSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const company = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [value.company_id],
      );

      if (company.rows.length === 0) {
        return next(new NotFoundError(`Company not found`));
      }

      const category = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [value.category_id],
      );

      if (category.rows.length === 0) {
        return next(new NotFoundError(`Category not found`));
      }

      const id = generateId();

      const result = await pool.query(
        `INSERT INTO jobs (
           id, title, description, company_id, category_id,
           job_type, experience_level, location_type, location_city,
           salary_min, salary_max, is_salary_visible, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          id,
          value.title,
          value.description,
          value.company_id,
          value.category_id,
          value.job_type,
          value.experience_level,
          value.location_type,
          value.location_city,
          value.salary_min,
          value.salary_max,
          value.is_salary_visible,
          value.status,
        ],
      );

      return response(res, 201, "Job created", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;

      const { error, value } = jobSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const existing = await pool.query("SELECT id FROM jobs WHERE id = $1", [
        id,
      ]);

      if (existing.rows.length === 0) {
        return next(new NotFoundError(`Job not found`));
      }

      const company = await pool.query(
        "SELECT id FROM companies WHERE id = $1",
        [value.company_id],
      );

      if (company.rows.length === 0) {
        return next(new NotFoundError(`Company not found`));
      }

      const category = await pool.query(
        "SELECT id FROM categories WHERE id = $1",
        [value.category_id],
      );

      if (category.rows.length === 0) {
        return next(new NotFoundError(`Category not found`));
      }

      const result = await pool.query(
        `UPDATE jobs
         SET
           title            = $1,
           description      = $2,
           company_id       = $3,
           category_id      = $4,
           job_type         = $5,
           experience_level = $6,
           location_type    = $7,
           location_city    = $8,
           salary_min       = $9,
           salary_max       = $10,
           is_salary_visible = $11,
           status           = $12
         WHERE id = $13
         RETURNING *`,
        [
          value.title,
          value.description,
          value.company_id,
          value.category_id,
          value.job_type,
          value.experience_level,
          value.location_type,
          value.location_city,
          value.salary_min,
          value.salary_max,
          value.is_salary_visible,
          value.status,
          id,
        ],
      );

      return response(res, 200, "Job updated", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await pool.query("SELECT id FROM jobs WHERE id = $1", [
        id,
      ]);

      if (existing.rows.length === 0) {
        return next(new NotFoundError(`Job found`));
      }

      await pool.query("DELETE FROM jobs WHERE id = $1", [id]);

      return response(res, 200, "Job deleted", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = JobController;
