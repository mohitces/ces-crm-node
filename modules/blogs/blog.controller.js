const asyncHandler = require('../../utils/asyncHandler');
const blogService = require('./blog.service');
const { uploadToFileService } = require('../../utils/fileServiceUploader');

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
  const uploadedCover = coverImage
    ? await uploadToFileService(coverImage.buffer, coverImage.originalname, 'ces-pl', 'blogs/covers')
    : null;
  const blog = await blogService.createBlog(req.body, uploadedCover, req.user);
  res.status(201).json(blog);
});

const updateBlog = asyncHandler(async (req, res) => {
  const coverImage = req.files?.find((file) => file.fieldname === 'coverImage') || null;
  const uploadedCover = coverImage
    ? await uploadToFileService(coverImage.buffer, coverImage.originalname, 'ces-pl', 'blogs/covers')
    : null;
  const blog = await blogService.updateBlog(req.params.id, req.body, uploadedCover);
  res.json(blog);
});

const deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteBlog(req.params.id);
  res.json({ message: 'Blog deleted' });
});

const uploadImage = asyncHandler(async (req, res) => {
  const imageFile = req.files?.[0];
  if (!imageFile) {
    return res.status(400).json({ message: 'No image provided' });
  }
  const uploadedImage = await uploadToFileService(imageFile.buffer, imageFile.originalname, 'ces-pl', 'blogs/content');
  res.json({ url: uploadedImage.url });
});

module.exports = {
  getBlogs,
  getPublishedBlogs,
  getBlogById,
  getPublishedBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImage,
};
