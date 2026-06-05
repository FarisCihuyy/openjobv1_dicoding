const Joi = require("joi");

const companySchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().min(5).required(),
  location: Joi.string().max(255).required(),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().max(255),
  description: Joi.string().min(5),
  location: Joi.string().max(255),
});

module.exports = {
  companySchema,
  updateCompanySchema,
};
