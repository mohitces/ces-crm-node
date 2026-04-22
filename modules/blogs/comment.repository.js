const Comment = require('./comment.model');

const createComment = async (payload) => {
  const comment = new Comment(payload);
  return comment.save();
};

const getCommentsByBlogSlug = async (blogSlug, page = 1, limit = 20, includeHidden = false) => {
  const skip = (page - 1) * limit;
  const query = includeHidden ? { blogSlug } : { blogSlug, hidden: false };

  const [comments, total] = await Promise.all([
    Comment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Comment.countDocuments(query),
  ]);

  return {
    comments,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

const getCommentById = async (id) => Comment.findById(id);

const updateCommentById = async (id, payload) =>
  Comment.findByIdAndUpdate(id, payload, { new: true });

const deleteCommentById = async (id) => Comment.findByIdAndDelete(id);

const deleteCommentWithReplies = async (id) => {
  await Comment.deleteMany({ $or: [{ _id: id }, { parentId: id }] });
};

module.exports = {
  createComment,
  getCommentsByBlogSlug,
  getCommentById,
  updateCommentById,
  deleteCommentById,
  deleteCommentWithReplies,
};
