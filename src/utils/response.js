/**
 * Untuk mengembalikan response yang seragam ke client
 * @param {object} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} data
 * @return {object}
 */

const response = (res, statusCode, message, data, headers = {}) => {
  const finalHeaders = {
    "X-Data-Source": "database",
    ...headers,
  };

  res.set(finalHeaders);

  return res.status(statusCode).json({
    code: statusCode,
    status: statusCode < 400 ? "success" : "failed",
    message,
    ...(data && { data }),
  });
};

module.exports = response;
