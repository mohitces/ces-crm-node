const express = require('express');
const commentController = require('./comment.controller');
const requireAuth = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/roles');
const validate = require('../../middlewares/validate');
const {
  createCommentSchema,
  listCommentsQuerySchema,
  slugParamsSchema,
  commentIdParamsSchema,
  visibilitySchema,
} = require('./comment.validation');

const router = express.Router();

router.get(
  '/:slug/comments',
  validate(slugParamsSchema, 'params'),
  validate(listCommentsQuerySchema, 'query'),
  commentController.listPublicComments,
);

router.post(
  '/:slug/comments',
  validate(slugParamsSchema, 'params'),
  validate(createCommentSchema, 'body'),
  commentController.createComment,
);

router.get(
  '/:slug/comments/admin',
  requireAuth,
  requireRole('admin', 'editor'),
  validate(slugParamsSchema, 'params'),
  validate(listCommentsQuerySchema, 'query'),
  commentController.listAdminComments,
);

router.patch(
  '/comments/:id/visibility',
  requireAuth,
  requireRole('admin', 'editor'),
  validate(commentIdParamsSchema, 'params'),
  validate(visibilitySchema, 'body'),
  commentController.updateVisibility,
);

router.delete(
  '/comments/:id',
  requireAuth,
  requireRole('admin', 'editor'),
  validate(commentIdParamsSchema, 'params'),
  commentController.deleteComment,
);

module.exports = router;
