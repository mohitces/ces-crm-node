const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const blogIdParamsSchema = Joi.object({
  id: Joi.string().pattern(objectIdRegex).required(),
});

const blogSlugParamsSchema = Joi.object({
  slug: Joi.string().trim().min(1).max(220).required(),
});

const createBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  slug: Joi.string().trim().max(220).optional(),
  excerpt: Joi.string().trim().max(500).allow('').optional(),
  content: Joi.string().trim().min(10).required(),
  metaTitle: Joi.string().trim().max(160).allow('').optional(),
  metaDescription: Joi.string().trim().max(320).allow('').optional(),
  tags: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
  categories: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
  status: Joi.string().valid('draft', 'published').optional(),
});

const updateBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  slug: Joi.string().trim().max(220).optional(),
  excerpt: Joi.string().trim().max(500).allow('').optional(),
  content: Joi.string().trim().min(10).optional(),
  metaTitle: Joi.string().trim().max(160).allow('').optional(),
  metaDescription: Joi.string().trim().max(320).allow('').optional(),
  tags: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
  categories: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
  status: Joi.string().valid('draft', 'published').optional(),
  clearCover: Joi.boolean().optional(),
}).min(1);

module.exports = {
  blogIdParamsSchema,
  blogSlugParamsSchema,
  createBlogSchema,
  updateBlogSchema,
};
