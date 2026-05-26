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

const updateJobSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  company_id: Joi.string().max(50).optional(),
  category_id: Joi.string().max(50).optional(),
  job_type: Joi.string()
    .valid("full-time", "part-time", "freelance", "internship")
    .optional(),
  experience_level: Joi.string().valid("junior", "mid", "senior").optional(),
  location_type: Joi.string().valid("remote", "onsite", "hybrid").optional(),
  location_city: Joi.string().max(255).optional(),
  salary_min: Joi.number().integer().min(0).optional(),
  salary_max: Joi.number().integer().min(0).optional(),
  is_salary_visible: Joi.boolean().optional(),
  status: Joi.string().valid("open", "close").optional(),
}).min(1);

module.exports = {
  jobSchema,
  updateJobSchema,
};
