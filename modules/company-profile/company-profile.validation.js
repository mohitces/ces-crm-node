const Joi = require('joi');

const createCompanyProfileRequestSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).required(),
  lastName: Joi.string().trim().min(1).max(60).required(),
  phone: Joi.string().trim().min(7).max(20).required(),
  email: Joi.string().trim().email().required(),
  companyName: Joi.string().trim().min(1).max(100).required(),
});

module.exports = {
  createCompanyProfileRequestSchema,
};

