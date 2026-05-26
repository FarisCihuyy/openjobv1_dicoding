const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  InvariantError,
  NotFoundError,
  AuthenticationError,
} = require("../../exceptions");
const response = require("../../utils/response");
const pool = require("../../database/pool");
const {
  loginSchema,
  refreshSchema,
} = require("../validations/auth.validation");

const JWT_SECRET = process.env.JWT_SECRET ?? "abcdefg123456hahahahayukkkk";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "yahahahahhahayukkkkk";

const AuthenticationController = {
  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const result = await pool.query(
        "SELECT id, name, email, password FROM users WHERE email = $1",
        [value.email],
      );

      if (result.rows.length === 0) {
        return next(new AuthenticationError("Invalid email or password"));
      }

      const user = result.rows[0];

      const isPasswordValid = await bcrypt.compare(
        value.password,
        user.password,
      );
      if (!isPasswordValid) {
        return next(new AuthenticationError("Invalid email or password"));
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      await pool.query(
        "INSERT INTO authentications (token, created_at) VALUES ($1, NOW())",
        [refreshToken],
      );

      return response(res, 200, "Login successful", {
        ...user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const { error, value } = refreshSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const tokenInDb = await pool.query(
        "SELECT token FROM authentications WHERE token = $1",
        [value.refreshToken],
      );

      if (tokenInDb.rows.length === 0) {
        return next(
          new InvariantError("Refresh token is invalid or has been revoked"),
        );
      }

      let decoded;
      try {
        decoded = jwt.verify(value.refreshToken, JWT_REFRESH_SECRET);
      } catch (err) {
        await pool.query("DELETE FROM authentications WHERE token = $1", [
          value.refreshToken,
        ]);

        return next(
          new AuthenticationError("Refresh token is expired or invalid"),
        );
      }

      const newAccessToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      return response(res, 200, "Access token refreshed", {
        accessToken: newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const { error, value } = refreshSchema.validate(req.body);

      if (error) {
        return next(new InvariantError(error.details[0].message));
      }

      const tokenInDb = await pool.query(
        "SELECT token FROM authentications WHERE token = $1",
        [value.refreshToken],
      );

      if (tokenInDb.rows.length === 0) {
        return next(new InvariantError("Refresh token is invalid"));
      }

      await pool.query("DELETE FROM authentications WHERE token = $1", [
        value.refreshToken,
      ]);

      return response(res, 200, "Logout successful", null);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuthenticationController;
