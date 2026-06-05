const pool = require("../../database/pool");
const { NotFoundError } = require("../../exceptions");
const { formatApplication } = require("../../utils");
const response = require("../../utils/response");

const BOOKMARK_SELECT = `
  b.id,
  b.created_at,
  j.id    AS job_id,
  j.title AS job_title,
  j.description AS job_description,
  j.job_type,
  j.location_type,
  j.location_city,
  j.status AS job_status,
  j.salary_max AS job_salary_max,
  c.id    AS company_id,
  c.name  AS company_name,
  c.location AS company_location,
  cat.id   AS category_id,
  cat.name AS category_name
`;

const BOOKMARK_JOIN = `
  FROM bookmarks b
  JOIN jobs       j   ON b.job_id      = j.id
  JOIN companies  c   ON j.company_id  = c.id
  JOIN categories cat ON j.category_id = cat.id
`;

const ProfileController = {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError("User not found"));
      }

      return response(res, 200, "Profile retrieved", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  async getMyApplications(req, res, next) {
    try {
      const userId = req.user.id;

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
        j.location_city AS job_location_city,
        c.id    AS company_id,
        c.name  AS company_name,
        d.id        AS document_id,
        d.file_name AS document_file_name,
        d.file_url  AS document_file_url
      `;

      const APPLICATION_JOIN = `
        FROM applications a
        JOIN users     u ON a.user_id     = u.id
        JOIN jobs      j ON a.job_id      = j.id
        JOIN companies c ON j.company_id  = c.id
        LEFT JOIN documents d ON a.document_id = d.id
      `;

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

module.exports = ProfileController;
