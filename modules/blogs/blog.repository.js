const Blog = require('./blog.model');

const getBlogs = async () => Blog.find().sort({ createdAt: -1 });
const getPublishedBlogs = async () =>
  Blog.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 });

const getBlogById = async (id) => Blog.findById(id);
const getPublishedBlogBySlug = async (slug) =>
  Blog.findOne({ slug, status: 'published' });

const getBlogBySlug = async (slug) => Blog.findOne({ slug });

const createBlog = async (payload) => {
  const blog = new Blog(payload);
  return blog.save();
};

const updateBlog = async (id, payload) =>
  Blog.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

const deleteBlog = async (id) => Blog.findByIdAndDelete(id);

module.exports = {
  getBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogBySlug,
  getPublishedBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
