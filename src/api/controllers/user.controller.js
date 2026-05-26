const bcrypt = require("bcryptjs");
const pool = require("../../database/pool");
const { NotFoundError, InvariantError } = require("../../exceptions");
const response = require("../../utils/response");
const { userSchema } = require("../validations/user.validation");
const { generateId } = require("../../utils");

const userController = {
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError("User not found"));
      }

      return response(res, 200, "User found", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },
  async createUser(req, res, next) {
    try {
      const allowedRoles = ["admin", "user"];

      if (!allowedRoles.includes(req.body.role || "user")) {
        return next(new InvariantError(`Role ${req.body.role} does not exist`));
      }

      const { error, value } = userSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const existUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [value.email],
      );

      if (existUser.rows.length > 0) {
        return next(new InvariantError("Email already exist"));
      }

      const id = generateId();
      const hashedPassword = await bcrypt.hash(value.password, 10);
      const role = value.role || "user";

      const result = await pool.query(
        "INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
        [id, value.name, value.email, hashedPassword, role],
      );

      return response(res, 201, "User created", result.rows[0]);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
