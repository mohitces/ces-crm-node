const asyncHandler = require('../../utils/asyncHandler');
const blogService = require('./blog.service');

const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.getBlogs();
  res.json(blogs);
});

const getPublishedBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.getPublishedBlogs();
  res.json(blogs);
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.id);
  res.json(blog);
});

const getPublishedBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await blogService.getPublishedBlogBySlug(req.params.slug);
  res.json(blog);
});

const createBlog = asyncHandler(async (req, res) => {
  const coverImage = req.files?.find((file) => file.fieldname === 'coverImage') || null;
  const blog = await blogService.createBlog(req.body, coverImage, req.user);
  res.status(201).json(blog);
});

const updateBlog = asyncHandler(async (req, res) => {
  const coverImage = req.files?.find((file) => file.fieldname === 'coverImage') || null;
  const blog = await blogService.updateBlog(req.params.id, req.body, coverImage);
  res.json(blog);
});

const deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteBlog(req.params.id);
  res.json({ message: 'Blog deleted' });
});

module.exports = {
  getBlogs,
  getPublishedBlogs,
  getBlogById,
  getPublishedBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
