const fs = require('fs');
const path = require('path');
const blogRepository = require('./blog.repository');
const AppError = require('../../utils/AppError');
const { destroyByUrl, isCloudinaryUrl } = require('../../utils/cloudinary');

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uniqueSlug = async (base, excludeId) => {
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = await blogRepository.getBlogBySlug(slug);
    if (!existing || (excludeId && existing._id.toString() === excludeId)) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

const buildCoverUrl = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.secure_url || file.url || '';
};

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      }
    } catch (error) {
      // fall through to CSV parsing
    }
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const removeCover = async (coverUrl) => {
  if (!coverUrl) return;
  if (isCloudinaryUrl(coverUrl)) {
    await destroyByUrl(coverUrl);
    return;
  }
  const filePath = path.join(__dirname, '../../', coverUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getBlogs = async () => blogRepository.getBlogs();
const getPublishedBlogs = async () => blogRepository.getPublishedBlogs();

const getBlogById = async (id) => {
  const blog = await blogRepository.getBlogById(id);
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }
  return blog;
};

const getPublishedBlogBySlug = async (slug) => {
  const blog = await blogRepository.getPublishedBlogBySlug(slug);
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }
  return blog;
};

const createBlog = async (payload, file, user) => {
  const slugBase = toSlug(payload.slug || payload.title);
  const slug = await uniqueSlug(slugBase);

  const blog = await blogRepository.createBlog({
    title: payload.title.trim(),
    slug,
    excerpt: payload.excerpt?.trim() || '',
    content: payload.content,
    coverImageUrl: buildCoverUrl(file),
    metaTitle: payload.metaTitle?.trim() || '',
    metaDescription: payload.metaDescription?.trim() || '',
    tags: parseList(payload.tags),
    categories: parseList(payload.categories),
    status: payload.status || 'draft',
    author: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    publishedAt: payload.status === 'published' ? new Date() : null,
  });

  return blog;
};

const updateBlog = async (id, payload, file) => {
  const existing = await blogRepository.getBlogById(id);
  if (!existing) {
    throw new AppError('Blog not found', 404);
  }

  const update = {
    ...payload,
  };

  if (typeof payload.metaTitle === 'string') {
    update.metaTitle = payload.metaTitle.trim();
  }

  if (typeof payload.metaDescription === 'string') {
    update.metaDescription = payload.metaDescription.trim();
  }

  if (payload.tags !== undefined) {
    update.tags = parseList(payload.tags);
  }

  if (payload.categories !== undefined) {
    update.categories = parseList(payload.categories);
  }

  if (payload.clearCover === 'true' || payload.clearCover === true) {
    await removeCover(existing.coverImageUrl);
    update.coverImageUrl = '';
  }

  if (payload.title || payload.slug) {
    const slugBase = toSlug(payload.slug || payload.title || existing.title);
    update.slug = await uniqueSlug(slugBase, id);
  }

  if (file) {
    await removeCover(existing.coverImageUrl);
    update.coverImageUrl = buildCoverUrl(file);
  }

  if (payload.status === 'published' && !existing.publishedAt) {
    update.publishedAt = new Date();
  }

  if (payload.status === 'draft') {
    update.publishedAt = null;
  }

  const updated = await blogRepository.updateBlog(id, update);
  return updated;
};

const deleteBlog = async (id) => {
  const existing = await blogRepository.getBlogById(id);
  if (!existing) {
    throw new AppError('Blog not found', 404);
  }

  await removeCover(existing.coverImageUrl);
  await blogRepository.deleteBlog(id);
};

module.exports = {
  getBlogs,
  getPublishedBlogs,
  getBlogById,
  getPublishedBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
