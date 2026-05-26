const pool = require("../../database/pool");
const { InvariantError, NotFoundError } = require("../../exceptions");
const { generateId } = require("../../utils");
const response = require("../../utils/response");
const {
  applicationSchema,
  updateApplicationSchema,
} = require("../validations/application.validation");

const APPLICATION_SELECT = `
  a.id,
  a.status,
  a.created_at,
  a.updated_at,
  u.id    AS user_id,
  u.name  AS user_name,
  u.email AS user_email,
  j.id    AS job_id,
  j.title AS job_title,
  c.id    AS company_id,
  c.name  AS company_name
`;

const APPLICATION_JOIN = `
  FROM applications a
  JOIN users     u ON a.user_id    = u.id
  JOIN jobs      j ON a.job_id     = j.id
  JOIN companies c ON j.company_id = c.id
`;

const ApplicationController = {
  async create(req, res, next) {
    try {
      const { error, value } = applicationSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const userId = req.user.id;

      const job = await pool.query(
        "SELECT id, status FROM jobs WHERE id = $1",
        [value.job_id],
      );

      if (job.rows.length === 0) {
        return next(new NotFoundError(`Job not found`));
      }

      if (job.rows[0].status === "closed") {
        return next(
          new InvariantError("This job is no longer accepting applications"),
        );
      }

      //   const document = await pool.query(
      //     "SELECT id FROM documents WHERE id = $1 AND user_id = $2",
      //     [value.document_id, userId],
      //   );

      //   if (document.rows.length === 0) {
      //     return next(new NotFoundError(`Document not found`));
      //   }

      const existing = await pool.query(
        "SELECT id FROM applications WHERE user_id = $1 AND job_id = $2",
        [userId, value.job_id],
      );

      if (existing.rows.length > 0) {
        return next(
          new InvariantError("You have already applied for this job"),
        );
      }

      const id = generateId();

      const result = await pool.query(
        `INSERT INTO applications (id, user_id, job_id, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [id, userId, value.job_id],
      );

      return response(res, 201, "Application submitted", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await pool.query(
        `SELECT ${APPLICATION_SELECT} ${APPLICATION_JOIN} ORDER BY a.created_at DESC`,
      );

      return response(res, 200, "Applications retrieved", {
        applications: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT ${APPLICATION_SELECT} ${APPLICATION_JOIN} WHERE a.id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError(`Application not found`));
      }

      return response(res, 200, "Application retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await pool.query("SELECT id FROM users WHERE id = $1", [
        userId,
      ]);

      //   if (user.rows.length === 0) {
      //     return next(new NotFoundError(`User not found`));
      //   }

      const result = await pool.query(
        `SELECT ${APPLICATION_SELECT} ${APPLICATION_JOIN}
         WHERE a.user_id = $1
         ORDER BY a.created_at DESC`,
        [userId],
      );

      return response(res, 200, "Applications retrieved", {
        applications: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async getByJob(req, res, next) {
    try {
      const { jobId } = req.params;

      const job = await pool.query("SELECT id FROM jobs WHERE id = $1", [
        jobId,
      ]);

      //   if (job.rows.length === 0) {
      //     return next(new NotFoundError(`Job not found`));
      //   }

      const result = await pool.query(
        `SELECT ${APPLICATION_SELECT} ${APPLICATION_JOIN}
         WHERE a.job_id = $1
         ORDER BY a.created_at DESC`,
        [jobId],
      );

      return response(res, 200, "Applications retrieved", {
        applications: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;

      const { error, value } = updateApplicationSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const existing = await pool.query(
        "SELECT id FROM applications WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError(`Application not found`));
      }

      const result = await pool.query(
        `UPDATE applications
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [value.status, id],
      );

      return response(res, 200, "Application status updated", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await pool.query(
        "SELECT id FROM applications WHERE id = $1",
        [id],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError(`Application not found`));
      }

      await pool.query("DELETE FROM applications WHERE id = $1", [id]);

      return response(res, 200, "Application deleted", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ApplicationController;
