/**
 * Untuk mengembalikan response yang seragam ke client
 * @param {object} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} data
 * @return {object}
 */

const response = (res, statusCode, message, data = undefined) => {
  const payload = {
    code: statusCode,
    status: statusCode < 400 ? "success" : "failed",
    message,
  };

  if (data) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

module.exports = response;
