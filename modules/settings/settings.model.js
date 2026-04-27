const mongoose = require('mongoose');

const { Schema } = mongoose;

const SOCIAL_PLATFORMS = ['linkedin', 'x', 'facebook', 'instagram', 'youtube'];

const settingsSchema = new Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },
    socialLinks: [
      {
        platform: {
          type: String,
          enum: SOCIAL_PLATFORMS,
          required: true,
        },
        url: {
          type: String,
          default: '',
        },
      },
    ],
    technicalSupport: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    enterprisePartnerships: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    businessHours: {
      timezone: { type: String, default: 'IST' },
      monFri: { type: String, default: '' },
      saturday: { type: String, default: '' },
      sunday: { type: String, default: '' },
    },
    companyStats: [
      {
        value: { type: String, default: '' },
        label: { type: String, default: '' },
        icon: { type: String, default: '' },
      },
    ],
    locations: [
      {
        title: { type: String, default: '' },
        address: { type: String, default: '' },
      },
    ],
    legalContent: { type: String, default: '' },
    privacyContent: { type: String, default: '' },
    lifeAtCesContent: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
