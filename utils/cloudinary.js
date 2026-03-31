const cloudinary = require('cloudinary').v2;

let configured = false;

const ensureConfigured = () => {
  if (configured) return;
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
  if (missing.length) {
    const error = new Error(`Cloudinary config missing: ${missing.join(', ')}`);
    error.code = 'CLOUDINARY_CONFIG_MISSING';
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
};

const uploadBuffer = (buffer, options = {}) => {
  ensureConfigured();
  return (
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });

      stream.end(buffer);
    })
  );
};

const isCloudinaryUrl = (url) =>
  typeof url === 'string' && url.includes('res.cloudinary.com/');

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  const cleanUrl = url.split('?')[0].split('#')[0];
  const marker = '/upload/';
  const index = cleanUrl.indexOf(marker);
  if (index === -1) return null;
  let path = cleanUrl.slice(index + marker.length);
  path = path.replace(/^\/+/, '');
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return null;

  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
  const publicIdParts = versionIndex === -1 ? parts : parts.slice(versionIndex + 1);
  if (!publicIdParts.length) return null;

  const last = publicIdParts[publicIdParts.length - 1];
  publicIdParts[publicIdParts.length - 1] = last.replace(/\.[a-z0-9]+$/i, '');
  return publicIdParts.join('/');
};

const destroyByUrl = async (url, options = {}) => {
  if (!isCloudinaryUrl(url)) return false;
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return false;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', ...options });
  return true;
};

module.exports = {
  cloudinary,
  ensureConfigured,
  uploadBuffer,
  isCloudinaryUrl,
  extractPublicIdFromUrl,
  destroyByUrl,
};
