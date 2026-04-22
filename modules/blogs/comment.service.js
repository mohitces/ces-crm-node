const commentRepository = require('./comment.repository');
const Blog = require('./blog.model');
const AppError = require('../../utils/AppError');

const getBlogBySlugOrThrow = async (slug) => {
  const blog = await Blog.findOne({ slug: String(slug || '').toLowerCase().trim() }).select('_id slug');
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }
  return blog;
};

const createComment = async (slug, payload, user = null) => {
  const blog = await getBlogBySlugOrThrow(slug);

  const name = (payload.name || '').trim();
  const text = (payload.text || '').trim();

  if (!name || !text) {
    throw new AppError('Name and comment are required', 400);
  }

  return commentRepository.createComment({
    blogId: blog._id,
    blogSlug: blog.slug,
    parentId: payload.parentId || null,
    name,
    text,
    hidden: false,
    createdByUserId: user?._id || null,
  });
};

const getCommentsByBlogSlug = async (slug, page = 1, limit = 20, includeHidden = false) => {
  await getBlogBySlugOrThrow(slug);
  return commentRepository.getCommentsByBlogSlug(String(slug).toLowerCase(), page, limit, includeHidden);
};

const updateVisibility = async (id, hidden) => {
  const updated = await commentRepository.updateCommentById(id, { hidden: !!hidden });
  if (!updated) {
    throw new AppError('Comment not found', 404);
  }
  return updated;
};

const deleteComment = async (id) => {
  const existing = await commentRepository.getCommentById(id);
  if (!existing) {
    throw new AppError('Comment not found', 404);
  }
  await commentRepository.deleteCommentWithReplies(id);
};

module.exports = {
  createComment,
  getCommentsByBlogSlug,
  updateVisibility,
  deleteComment,
};
