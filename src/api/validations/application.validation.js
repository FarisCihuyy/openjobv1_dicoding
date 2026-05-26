const Joi = require("joi");

const applicationSchema = Joi.object({
  user_id: Joi.string().max(50).required(),
  job_id: Joi.string().max(50).required(),
  document_id: Joi.string().max(50).optional(),
  status: Joi.string()
    .valid("pending", "reviewed", "accepted", "rejected")
    .default("pending"),
});

const updateApplicationSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "reviewed", "accepted", "rejected")
    .required(),
});

module.exports = { applicationSchema, updateApplicationSchema };
