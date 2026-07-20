const express = require('express');
const blogController = require('./blog.controller');
const validate = require('../../middlewares/validate');
const requireAuth = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/roles');
const upload = require('./blog.upload');
const {
  blogIdParamsSchema,
  blogSlugParamsSchema,
  createBlogSchema,
  updateBlogSchema,
} = require('./blog.validation');

const router = express.Router();

router.get('/public', blogController.getPublishedBlogs);
router.get('/public/:slug', validate(blogSlugParamsSchema, 'params'), blogController.getPublishedBlogBySlug);

router.get('/', requireAuth, blogController.getBlogs);
router.get('/:id', requireAuth, validate(blogIdParamsSchema, 'params'), blogController.getBlogById);
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'editor'),
  upload.any(),
  validate(createBlogSchema),
  blogController.createBlog
);
router.post(
  '/upload',
  requireAuth,
  requireRole('admin', 'editor'),
  upload.any(),
  blogController.uploadImage
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'editor'),
  upload.any(),
  validate(blogIdParamsSchema, 'params'),
  validate(updateBlogSchema),
  blogController.updateBlog,
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'editor'),
  validate(blogIdParamsSchema, 'params'),
  blogController.deleteBlog
);

module.exports = router;
