const fs = require('fs');
const path = require('path');
const AppError = require('../../utils/AppError');
const partnerRepository = require('./partner.repository');
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
    const existing = await partnerRepository.getPartnerBySlug(slug);
    if (!existing || (excludeId && existing._id.toString() === excludeId)) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

const removeFile = async (imageUrl, marker) => {
  if (!imageUrl) return;
  if (isCloudinaryUrl(imageUrl)) {
    await destroyByUrl(imageUrl);
    return;
  }
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;
  const relative = imageUrl.slice(index);
  const filePath = path.join(__dirname, '../../', relative);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const getPartners = async () => partnerRepository.getPartners();

const toPublicDto = (partner) => ({
  id: partner._id,
  name: partner.name,
  slug: partner.slug,
  type: partner.type,
  logo: partner.logo,
  bannerImage: partner.bannerImage,
  website: partner.website || '',
  description: partner.description || '',
  sortOrder: typeof partner.sortOrder === 'number' ? partner.sortOrder : 0,
  createdAt: partner.createdAt,
});

const getPublicPartners = async () => {
  const partners = await partnerRepository.getPublicPartners();
  return partners.map((partner) => toPublicDto(partner));
};

const getPartnerById = async (id) => {
  const partner = await partnerRepository.getPartnerById(id);
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }
  return partner;
};

const createPartner = async (payload) => {
  const slugBase = toSlug(payload.name);
  const slug = await uniqueSlug(slugBase);

  const partner = await partnerRepository.createPartner({
    name: payload.name.trim(),
    slug,
    type: payload.type || 'client',
    logo: payload.logo,
    bannerImage: payload.bannerImage || '',
    website: payload.website?.trim() || '',
    description: payload.description?.trim() || '',
    status: payload.status || 'active',
    sortOrder: payload.sortOrder ?? 0,
  });

  return partner;
};

const updatePartner = async (id, payload) => {
  const existing = await partnerRepository.getPartnerById(id);
  if (!existing) {
    throw new AppError('Partner not found', 404);
  }

  const update = {
    ...payload,
  };

  if (payload.name) {
    update.name = payload.name.trim();
    const slugBase = toSlug(update.name);
    update.slug = await uniqueSlug(slugBase, id);
  }

  if (payload.website !== undefined) {
    update.website = normalizeString(payload.website) || '';
  }

  if (payload.description !== undefined) {
    update.description = normalizeString(payload.description) || '';
  }

  if (payload.logo !== undefined) {
    const nextLogo = normalizeString(payload.logo) || '';
    if (nextLogo !== existing.logo) {
      await removeFile(existing.logo, '/uploads/partners/logos/');
    }
    update.logo = nextLogo;
  }

  if (payload.bannerImage !== undefined) {
    const nextBanner = normalizeString(payload.bannerImage) || '';
    if (nextBanner !== existing.bannerImage) {
      await removeFile(existing.bannerImage, '/uploads/partners/banners/');
    }
    update.bannerImage = nextBanner;
  }

  const updated = await partnerRepository.updatePartner(id, update);
  return updated;
};

const deletePartner = async (id) => {
  const existing = await partnerRepository.getPartnerById(id);
  if (!existing) {
    throw new AppError('Partner not found', 404);
  }
  await removeFile(existing.logo, '/uploads/partners/logos/');
  await removeFile(existing.bannerImage, '/uploads/partners/banners/');
  await partnerRepository.deletePartner(id);
};

module.exports = {
  getPartners,
  getPublicPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
};
