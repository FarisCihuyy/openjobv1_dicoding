const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().max(255).required(),
});

module.exports = categorySchema;
