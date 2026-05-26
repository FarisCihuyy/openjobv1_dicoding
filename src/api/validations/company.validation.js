const Joi = require("joi");

const companySchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().min(5).required(),
  location: Joi.string().max(255).required(),
});

module.exports = companySchema;
