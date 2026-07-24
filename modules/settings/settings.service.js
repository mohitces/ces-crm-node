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
  privacyContent: 'Privacy Policy – CES Tech\n\nEffective Date: 23 July 2026\n\nAt CES Tech, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information when you visit our website or use our services.\n\nBy accessing our website or engaging with our services, you agree to the practices described in this Privacy Policy.\n\n1. Information We Collect\n\nWe may collect the following types of information:\n\nPersonal Information:\n- Full Name\n- Company Name\n- Email Address\n- Phone Number\n- Job Title\n- Billing Address\n- Project Information\n- Resume/CV (for recruitment)\n- Any information submitted through contact or inquiry forms\n\nTechnical Information:\n- IP Address\n- Browser Type\n- Operating System\n- Device Information\n- Website Usage Data\n- Cookies and Analytics Information\n\n2. How We Use Your Information\n\nCES Tech may use your information to:\n- Respond to inquiries and support requests.\n- Deliver IT implementation, migration, managed services, and consulting.\n- Prepare quotations, proposals, and contracts.\n- Provide customer support.\n- Schedule project resources.\n- Process invoices and payments.\n- Improve our website and services.\n- Send important updates regarding projects or services.\n- Share marketing communications (only where permitted).\n- Conduct recruitment and hiring activities.\n- Comply with legal and regulatory obligations.\n\n3. Cookies\n\nOur website may use cookies and similar technologies to improve website performance, remember user preferences, analyze website traffic, and enhance user experience.\n\nYou may disable cookies through your browser settings; however, some features of the website may not function properly.\n\n4. Data Security\n\nCES Tech implements appropriate technical and organizational security measures to protect your information against unauthorized access, data loss, misuse, alteration, and disclosure.\n\nWhile we strive to use commercially acceptable means to protect your information, no method of transmission or storage is completely secure.\n\n5. Information Sharing\n\nCES Tech does not sell, rent, or trade your personal information.\n\nWe may share information only with authorized employees, project partners or subcontractors (where required for service delivery), payment service providers, government or regulatory authorities when legally required, and professional advisors such as auditors or legal consultants.\n\nAll third parties are required to maintain confidentiality.\n\n6. Confidentiality of Client Information\n\nCES Tech understands the confidential nature of client environments. Any project documentation, network diagrams, configurations, credentials, architecture details, migration plans, or business information shared with us will be treated as confidential and used solely for the purpose of delivering contracted services.\n\n7. Data Retention\n\nWe retain personal information only for as long as necessary to deliver contracted services, meet legal obligations, resolve disputes, maintain business records, and support warranty and service commitments.\n\nOnce no longer required, information is securely deleted or anonymized.\n\n8. Your Rights\n\nDepending on applicable law, you may request to access your personal information, correct inaccurate information, update your details, delete your personal information (where legally permissible), withdraw consent for marketing communications, or request a copy of your personal data.\n\nRequests will be processed within a reasonable timeframe.\n\n9. Third-Party Links\n\nOur website may contain links to third-party websites. CES Tech is not responsible for the privacy practices or content of external websites. Users are encouraged to review the privacy policies of those websites before providing personal information.\n\n10. Recruitment Information\n\nApplicants submitting resumes or job applications agree that CES Tech may review application details, contact candidates regarding employment opportunities, and retain resumes for future openings unless the applicant requests removal.\n\nRecruitment information is handled confidentially.\n\n11. Children\'s Privacy\n\nOur services are intended for businesses and professionals. We do not knowingly collect personal information from individuals under the age of 18.\n\n12. Changes to This Privacy Policy\n\nCES Tech reserves the right to modify or update this Privacy Policy at any time. Changes become effective immediately upon publication on our website. Users are encouraged to review this page periodically.\n\n13. Contact Us\n\nIf you have any questions regarding this Privacy Policy or wish to exercise your privacy rights, please contact us:\n\nCES Tech\nEmail: info@ces-pl.com\nWebsite: www.ces-pl.com\n\nConsent\n\nBy using the CES Tech website or engaging our services, you acknowledge that you have read, understood, and agreed to this Privacy Policy.',
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
