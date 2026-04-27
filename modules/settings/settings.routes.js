const express = require('express');
const validate = require('../../middlewares/validate');
const requireAuth = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/roles');
const settingsController = require('./settings.controller');
const { updateSettingsSchema } = require('./settings.validation');
const upload = require('./settings.upload');

const router = express.Router();

router.get('/', requireAuth, settingsController.getSettings);
router.get('/public', settingsController.getSettings);
router.get('/public/life-at-ces', settingsController.getPublicLifeAtCesContent);
router.put(
  '/',
  requireAuth,
  requireRole('admin'),
  validate(updateSettingsSchema),
  settingsController.updateSettings
);
router.get('/life-at-ces', requireAuth, requireRole('admin', 'editor'), settingsController.getLifeAtCesContent);
router.put('/life-at-ces', requireAuth, requireRole('admin', 'editor'), settingsController.updateLifeAtCesContent);
router.post(
  '/life-at-ces/upload-media',
  requireAuth,
  requireRole('admin', 'editor'),
  upload.single('file'),
  settingsController.uploadLifeAtCesMedia
);

module.exports = router;
