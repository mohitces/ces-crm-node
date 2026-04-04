const cloudinary = require('cloudinary').v2;

let configured = false;

const normalizeEnv = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const ensureConfigured = () => {
  if (configured) return;
  const missing = [];
  const cloudName = normalizeEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = normalizeEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = normalizeEnv(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missing.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
  if (missing.length) {
    const error = new Error(`Cloudinary config missing: ${missing.join(', ')}`);
    error.code = 'CLOUDINARY_CONFIG_MISSING';
    throw error;
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
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

const uploadImageBuffer = (buffer, options = {}) =>
  uploadBuffer(buffer, {
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    ...options,
  });

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

const destroyByPublicId = async (publicId, options = {}) => {
  if (!publicId) return false;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', ...options });
  return true;
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
  uploadImageBuffer,
  isCloudinaryUrl,
  extractPublicIdFromUrl,
  destroyByPublicId,
  destroyByUrl,
};
