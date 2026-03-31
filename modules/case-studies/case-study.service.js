const fs = require('fs');
const path = require('path');
const caseStudyRepository = require('./case-study.repository');
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
    const existing = await caseStudyRepository.getCaseStudyBySlug(slug);
    if (!existing || (excludeId && existing._id.toString() === excludeId)) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

const buildAssetUrl = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.secure_url || file.url || '';
};

const parseJson = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const parseLines = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (error) {
      // fall through
    }
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const removeAsset = async (assetUrl) => {
  if (!assetUrl) return;
  if (isCloudinaryUrl(assetUrl)) {
    await destroyByUrl(assetUrl);
    return;
  }
  const filePath = path.join(__dirname, '../../', assetUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getCaseStudies = async () => caseStudyRepository.getCaseStudies();
const getPublishedCaseStudies = async () => caseStudyRepository.getPublishedCaseStudies();

const getCaseStudyById = async (id) => {
  const item = await caseStudyRepository.getCaseStudyById(id);
  if (!item) throw new AppError('Case study not found', 404);
  return item;
};

const getPublishedCaseStudyBySlug = async (slug) => {
  const item = await caseStudyRepository.getPublishedCaseStudyBySlug(slug);
  if (!item) throw new AppError('Case study not found', 404);
  return item;
};

const buildPayload = async (payload, files, existing) => {
  const slugBase = toSlug(payload.slug || payload.title || payload.clientName);
  const slug = await uniqueSlug(slugBase, existing ? existing._id.toString() : undefined);

  const snapshot = parseJson(payload.snapshot) || {};
  const about = parseJson(payload.about) || {};
  const challenges = parseJson(payload.challenges) || {};
  const solutions = parseJson(payload.solutions) || {};
  const results = parseJson(payload.results) || {};

  const highlights = parseLines(payload.highlights);
  const mediaUrls = parseLines(payload.mediaUrls);

  const logoFile = files?.find((file) => file.fieldname === 'clientLogo') || null;
  const bannerFile = files?.find((file) => file.fieldname === 'bannerImage') || null;
  const mediaFiles = files?.filter((file) => file.fieldname === 'mediaImages') || [];

  const logoUrl = logoFile ? buildAssetUrl(logoFile) : payload.clientLogoUrl || existing?.clientLogo || '';
  const bannerUrl = bannerFile ? buildAssetUrl(bannerFile) : payload.bannerImageUrl || existing?.bannerImage || '';

  const mediaImages = [...mediaUrls, ...mediaFiles.map((file) => buildAssetUrl(file))];

  if (existing && logoFile) {
    await removeAsset(existing.clientLogo);
  }

  if (existing && bannerFile) {
    await removeAsset(existing.bannerImage);
  }

  return {
    clientName: payload.clientName?.trim() || existing?.clientName,
    slug,
    status: payload.status || existing?.status || 'draft',
    featured: payload.featured === 'true' || payload.featured === true,
    title: payload.title?.trim() || existing?.title,
    subtitle: payload.subtitle?.trim() || '',
    clientLogo: logoUrl,
    bannerImage: bannerUrl,
    snapshot: {
      websiteUrl: snapshot.websiteUrl || '',
      country: snapshot.country || '',
      industry: snapshot.industry || '',
      platform: snapshot.platform || '',
      businessInsight: snapshot.businessInsight || '',
    },
    about: {
      brandIntro: about.brandIntro || '',
      whatTheyDo: about.whatTheyDo || '',
    },
    challenges: {
      problemStatements: parseLines(challenges.problemStatements),
    },
    solutions: {
      howWeHelped: solutions.howWeHelped || '',
      featuresUsed: parseLines(solutions.featuresUsed),
    },
    highlights,
    results: {
      benefits: parseLines(results.benefits),
    },
    media: {
      images: mediaImages,
    },
  };
};

const createCaseStudy = async (payload, files) => {
  const data = await buildPayload(payload, files);
  return caseStudyRepository.createCaseStudy(data);
};

const updateCaseStudy = async (id, payload, files) => {
  const existing = await caseStudyRepository.getCaseStudyById(id);
  if (!existing) throw new AppError('Case study not found', 404);

  const data = await buildPayload(payload, files, existing);
  return caseStudyRepository.updateCaseStudy(id, data);
};

const deleteCaseStudy = async (id) => {
  const existing = await caseStudyRepository.getCaseStudyById(id);
  if (!existing) throw new AppError('Case study not found', 404);

  await removeAsset(existing.clientLogo);
  await removeAsset(existing.bannerImage);
  for (const image of existing.media?.images || []) {
    await removeAsset(image);
  }

  await caseStudyRepository.deleteCaseStudy(id);
};

module.exports = {
  getCaseStudies,
  getPublishedCaseStudies,
  getCaseStudyById,
  getPublishedCaseStudyBySlug,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
};
