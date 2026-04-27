const asyncHandler = require('../../utils/asyncHandler');
const settingsService = require('./settings.service');
const { uploadImageBuffer } = require('../../utils/cloudinary');

const getSettings = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  const settings = await settingsService.getSettings();
  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  res.json(settings);
});

const getLifeAtCesContent = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  const content = await settingsService.getLifeAtCesContent();
  res.json({ lifeAtCesContent: content });
});

const getPublicLifeAtCesContent = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  const content = await settingsService.getLifeAtCesContent();
  res.json({ lifeAtCesContent: content });
});

const updateLifeAtCesContent = asyncHandler(async (req, res) => {
  const content = await settingsService.updateLifeAtCesContent(req.body.lifeAtCesContent);
  res.json({ lifeAtCesContent: content });
});

const uploadLifeAtCesMedia = asyncHandler(async (req, res) => {
  const file = req.file || null;
  if (!file) {
    res.status(400).json({ message: 'File is required.' });
    return;
  }
  const upload = await uploadImageBuffer(file.buffer, { folder: 'ces/life-at-ces' });
  res.status(201).json({ url: upload.secure_url, publicId: upload.public_id });
});

module.exports = {
  getSettings,
  updateSettings,
  getLifeAtCesContent,
  getPublicLifeAtCesContent,
  updateLifeAtCesContent,
  uploadLifeAtCesMedia,
};
