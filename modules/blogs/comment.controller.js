const commentService = require('./comment.service');
const asyncHandler = require('../../utils/asyncHandler');

const mapComment = (comment) => ({
  _id: comment._id,
  blogSlug: comment.blogSlug,
  parentId: comment.parentId,
  name: comment.name,
  text: comment.text,
  hidden: comment.hidden,
  createdAt: comment.createdAt,
});

const listPublicComments = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const result = await commentService.getCommentsByBlogSlug(req.params.slug, page, limit, false);

  res.json({
    comments: result.comments.map(mapComment),
    total: result.total,
    page: result.page,
    pages: result.pages,
  });
});

const listAdminComments = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
  const result = await commentService.getCommentsByBlogSlug(req.params.slug, page, limit, true);

  res.json({
    comments: result.comments.map(mapComment),
    total: result.total,
    page: result.page,
    pages: result.pages,
  });
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment(req.params.slug, req.body, req.user || null);
  res.status(201).json(mapComment(comment));
});

const updateVisibility = asyncHandler(async (req, res) => {
  const comment = await commentService.updateVisibility(req.params.id, req.body.hidden);
  res.json({ message: 'Comment visibility updated', comment: mapComment(comment) });
});

const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.id);
  res.json({ message: 'Comment deleted' });
});

module.exports = {
  listPublicComments,
  listAdminComments,
  createComment,
  updateVisibility,
  deleteComment,
};
