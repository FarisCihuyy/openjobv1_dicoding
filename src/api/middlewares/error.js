const { ClientError } = require("../../exceptions");
const response = require("../../utils/response");

const ErrorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return response(res, err.statusCode, err.message, null);
  }

  if (err.isJoi) {
    return response(res, 400, err.details[0].message, null);
  }

  console.error(err);

  return response(res, 500, err.message || "Internal Server Error", null);
};

module.exports = ErrorHandler;
