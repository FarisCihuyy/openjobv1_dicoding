const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  24,
);

const generateId = () => nanoid();

module.exports = { generateId };
