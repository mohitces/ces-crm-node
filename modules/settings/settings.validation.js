const Joi = require('joi');

const SOCIAL_PLATFORMS = ['linkedin', 'x', 'facebook', 'instagram', 'youtube'];

const socialLinkSchema = Joi.object({
  platform: Joi.string()
    .valid(...SOCIAL_PLATFORMS)
    .required(),
  url: Joi.string().trim().allow('').optional(),
});

const contactSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).allow('').optional(),
  phone: Joi.string().trim().allow('').optional(),
});

const businessHoursSchema = Joi.object({
  timezone: Joi.string().trim().allow('').optional(),
  monFri: Joi.string().trim().allow('').optional(),
  saturday: Joi.string().trim().allow('').optional(),
  sunday: Joi.string().trim().allow('').optional(),
});

const locationSchema = Joi.object({
  title: Joi.string().trim().allow('').optional(),
  address: Joi.string().trim().allow('').optional(),
});

const statSchema = Joi.object({
  value: Joi.string().trim().min(1).required(),
  label: Joi.string().trim().min(1).required(),
  icon: Joi.string().trim().min(1).required(),
});

const updateSettingsSchema = Joi.object({
  socialLinks: Joi.array().items(socialLinkSchema).optional(),
  technicalSupport: contactSchema.optional(),
  enterprisePartnerships: contactSchema.optional(),
  businessHours: businessHoursSchema.optional(),
  companyStats: Joi.array().items(statSchema).length(4).optional(),
  locations: Joi.array().items(locationSchema).optional(),
  legalContent: Joi.string().trim().allow('').optional(),
  privacyContent: Joi.string().trim().allow('').optional(),
  lifeAtCesContent: Joi.object().unknown(true).allow(null).optional(),
}).min(1);

module.exports = {
  updateSettingsSchema,
};
