const settingsRepository = require('./settings.repository');

const SOCIAL_PLATFORMS = ['linkedin', 'x', 'facebook', 'instagram', 'youtube'];

const DEFAULT_SETTINGS = {
  key: 'global',
  socialLinks: SOCIAL_PLATFORMS.map((platform) => ({ platform, url: '' })),
technicalSupport: { email: '', phone: '+91-0120-6911071' },
enterprisePartnerships: { email: '', phone: '+91-0120-6911071' },
  businessHours: {
    timezone: 'IST',
    monFri: '',
    saturday: '',
    sunday: '',
  },
  companyStats: [
    { value: '2356+', label: 'Successful Projects', icon: 'task_alt' },
    { value: '675+', label: 'Running Projects', icon: 'pending_actions' },
    { value: '254+', label: 'Skilled Experts', icon: 'groups' },
    { value: '100%', label: 'Happy Clients', icon: 'sentiment_satisfied_alt' },
  ],
  locations: [
    {
      title: 'Noida Headquarters',
      address:
        'Assotech Business Cresterra, Tower-2, 9th Floor, Unit 901-902, Sector-135, Noida 201304, Uttar Pradesh',
    },
    {
      title: 'Noida Office',
      address: '4th Floor Bhagwan Sahay Complex, Sector-15, Noida 201301, Uttar Pradesh',
    },
    {
      title: 'Gurugram Office',
      address: '10th-11th Floor, Paras Trinity, Golf Course Ext Rd, Sector 63, Gurugram, Haryana 122011',
    },
  ],
  legalContent: 'Legal\n\nPlease add your legal terms and conditions here.',
  privacyContent: 'Privacy Policy\n\nPlease add your privacy policy here.',
  lifeAtCesContent: null,
};

const normalizeLinks = (links) => {
  const map = new Map();
  (links || []).forEach((link) => {
    if (!link || !link.platform) return;
    map.set(link.platform, typeof link.url === 'string' ? link.url.trim() : '');
  });
  return SOCIAL_PLATFORMS.map((platform) => ({
    platform,
    url: map.get(platform) || '',
  }));
};

const normalizeContact = (current, next) => ({
  email: typeof next?.email === 'string' ? next.email.trim() : current.email,
  phone: typeof next?.phone === 'string' ? next.phone.trim() : current.phone,
});

const normalizeHours = (current, next) => ({
  timezone: typeof next?.timezone === 'string' ? next.timezone.trim() || 'IST' : current.timezone || 'IST',
  monFri: typeof next?.monFri === 'string' ? next.monFri.trim() : current.monFri,
  saturday: typeof next?.saturday === 'string' ? next.saturday.trim() : current.saturday,
  sunday: typeof next?.sunday === 'string' ? next.sunday.trim() : current.sunday,
});

const normalizeLocations = (current, next) => {
  const source = Array.isArray(next) ? next : current;
  return (source || [])
    .map((item) => ({
      title: typeof item?.title === 'string' ? item.title.trim() : '',
      address: typeof item?.address === 'string' ? item.address.trim() : '',
    }))
    .filter((item) => item.title || item.address);
};

const normalizeStats = (current, next) => {
  const source = Array.isArray(next) ? next : current;
  const normalized = (source || []).map((item) => ({
    value: typeof item?.value === 'string' ? item.value.trim() : '',
    label: typeof item?.label === 'string' ? item.label.trim() : '',
    icon: typeof item?.icon === 'string' ? item.icon.trim() : '',
  }));
  const fallback = DEFAULT_SETTINGS.companyStats;
  return [0, 1, 2, 3].map((index) => ({
    value: normalized[index]?.value || fallback[index].value,
    label: normalized[index]?.label || fallback[index].label,
    icon: normalized[index]?.icon || fallback[index].icon,
  }));
};

const normalizeContent = (current, next) => {
  if (typeof next === 'string') return next.trim();
  return typeof current === 'string' ? current : '';
};

const toDto = (settings) => ({
  socialLinks: settings.socialLinks || [],
  technicalSupport: settings.technicalSupport || { email: '', phone: '' },
  enterprisePartnerships: settings.enterprisePartnerships || { email: '', phone: '' },
  businessHours: settings.businessHours || { timezone: 'IST', monFri: '', saturday: '', sunday: '' },
  companyStats: settings.companyStats || [],
  locations: settings.locations || [],
  legalContent: settings.legalContent || '',
  privacyContent: settings.privacyContent || '',
  lifeAtCesContent: settings.lifeAtCesContent || null,
});

const getSettings = async () => {
  let settings = await settingsRepository.getSettings();
  if (!settings) {
    settings = await settingsRepository.upsertSettings(DEFAULT_SETTINGS);
  }
  return toDto(settings);
};

const updateSettings = async (payload) => {
  const existing = await settingsRepository.getSettings();
  const base = existing ? existing.toObject() : DEFAULT_SETTINGS;

  const update = {
    key: 'global',
    socialLinks: normalizeLinks(payload.socialLinks ?? base.socialLinks),
    technicalSupport: normalizeContact(base.technicalSupport, payload.technicalSupport),
    enterprisePartnerships: normalizeContact(base.enterprisePartnerships, payload.enterprisePartnerships),
    businessHours: normalizeHours(base.businessHours, payload.businessHours),
    companyStats: normalizeStats(base.companyStats, payload.companyStats),
    locations: normalizeLocations(base.locations, payload.locations),
    legalContent: normalizeContent(base.legalContent, payload.legalContent),
    privacyContent: normalizeContent(base.privacyContent, payload.privacyContent),
    lifeAtCesContent:
      Object.prototype.hasOwnProperty.call(payload, 'lifeAtCesContent')
        ? payload.lifeAtCesContent
        : (base.lifeAtCesContent ?? null),
  };

  const saved = await settingsRepository.upsertSettings(update);
  return toDto(saved);
};

const getLifeAtCesContent = async () => {
  const settings = await getSettings();
  return settings.lifeAtCesContent || null;
};

const updateLifeAtCesContent = async (lifeAtCesContent) => {
  const existing = await settingsRepository.getSettings();
  const base = existing ? existing.toObject() : DEFAULT_SETTINGS;

  const update = {
    key: 'global',
    socialLinks: normalizeLinks(base.socialLinks),
    technicalSupport: normalizeContact(base.technicalSupport, base.technicalSupport),
    enterprisePartnerships: normalizeContact(base.enterprisePartnerships, base.enterprisePartnerships),
    businessHours: normalizeHours(base.businessHours, base.businessHours),
    companyStats: normalizeStats(base.companyStats, base.companyStats),
    locations: normalizeLocations(base.locations, base.locations),
    legalContent: normalizeContent(base.legalContent, base.legalContent),
    privacyContent: normalizeContent(base.privacyContent, base.privacyContent),
    lifeAtCesContent: lifeAtCesContent || null,
  };

  const saved = await settingsRepository.upsertSettings(update);
  return toDto(saved).lifeAtCesContent || null;
};

module.exports = {
  getSettings,
  updateSettings,
  getLifeAtCesContent,
  updateLifeAtCesContent,
};
