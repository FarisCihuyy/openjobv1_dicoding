const Joi = require("joi");

const jobSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().required(),
  company_id: Joi.string().max(50).required(),
  category_id: Joi.string().max(50).required(),
  job_type: Joi.string()
    .valid("full-time", "part-time", "freelance", "internship")
    .default("full-time"),
  experience_level: Joi.string()
    .valid("junior", "mid", "senior")
    .default("entry-level"),
  location_type: Joi.string()
    .valid("remote", "onsite", "hybrid")
    .default("remote"),
  location_city: Joi.string().max(255).default(""),
  salary_min: Joi.number().integer().min(0).default(0),
  salary_max: Joi.number().integer().min(0).default(0),
  is_salary_visible: Joi.boolean().default(true),
  status: Joi.string().valid("open", "close").default("open"),
});

module.exports = jobSchema;
