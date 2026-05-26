const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("../../exceptions");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AuthenticationError("Missing or invalid authorization header"),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    next(
      new AuthenticationError(
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      ),
    );
  }
};

module.exports = authMiddleware;
