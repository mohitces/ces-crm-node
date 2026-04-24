const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createCommentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required(),
  text: Joi.string().trim().min(1).max(1000).required(),
  parentId: Joi.string().pattern(objectIdRegex).allow(null).optional(),
});

const listCommentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
});

const slugParamsSchema = Joi.object({
  slug: Joi.string().trim().required(),
});

const commentIdParamsSchema = Joi.object({
  id: Joi.string().pattern(objectIdRegex).required(),
});

const visibilitySchema = Joi.object({
  hidden: Joi.boolean().required(),
});

module.exports = {
  createCommentSchema,
  listCommentsQuerySchema,
  slugParamsSchema,
  commentIdParamsSchema,
  visibilitySchema,
};
