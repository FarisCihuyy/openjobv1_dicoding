const pool = require("../../database/pool");
const { NotFoundError, InvariantError } = require("../../exceptions");
const { generateId } = require("../../utils");
const response = require("../../utils/response");

const BOOKMARK_SELECT = `
  b.id,
  b.created_at,
  u.id    AS user_id,
  u.name  AS user_name,
  j.id    AS job_id,
  j.title AS job_title,
  j.job_type,
  j.location_type,
  j.location_city,
  j.status AS job_status,
  c.id    AS company_id,
  c.name  AS company_name,
  c.location AS company_location,
  cat.id   AS category_id,
  cat.name AS category_name
`;

const BOOKMARK_JOIN = `
  FROM bookmarks b
  JOIN users      u   ON b.user_id     = u.id
  JOIN jobs       j   ON b.job_id      = j.id
  JOIN companies  c   ON j.company_id  = c.id
  JOIN categories cat ON j.category_id = cat.id
`;

const BookmarkController = {
  async create(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      const job = await pool.query("SELECT id FROM jobs WHERE id = $1", [
        jobId,
      ]);

      if (job.rows.length === 0) {
        return next(new NotFoundError(`Job not found`));
      }

      const existing = await pool.query(
        "SELECT id FROM bookmarks WHERE user_id = $1 AND job_id = $2",
        [userId, jobId],
      );

      if (existing.rows.length > 0) {
        return next(new InvariantError("You have already bookmarked this job"));
      }

      const id = generateId();

      const result = await pool.query(
        `INSERT INTO bookmarks (id, user_id, job_id, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [id, userId, jobId],
      );

      return response(res, 201, "Job bookmarked", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { jobId, id } = req.params;

      const result = await pool.query(
        `SELECT ${BOOKMARK_SELECT} ${BOOKMARK_JOIN}
         WHERE b.id = $1 AND b.job_id = $2`,
        [id, jobId],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError(`Bookmark not found`));
      }

      return response(res, 200, "Bookmark retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      const existing = await pool.query(
        "SELECT id FROM bookmarks WHERE user_id = $1 AND job_id = $2",
        [userId, jobId],
      );

      if (existing.rows.length === 0) {
        return next(new NotFoundError("Bookmark not found"));
      }

      await pool.query(
        "DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2",
        [userId, jobId],
      );

      return response(res, 200, "Bookmark removed", null);
    } catch (error) {
      next(error);
    }
  },

  async getMyBookmarks(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT ${BOOKMARK_SELECT} ${BOOKMARK_JOIN}
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId],
      );

      return response(res, 200, "Bookmarks retrieved", {
        bookmarks: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = BookmarkController;
