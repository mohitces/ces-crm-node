const queryRepository = require('./query.repository');
const AppError = require('../../utils/AppError');

const CONTACT_NOTIFICATION_EMAIL = 'info@ces-pl.com';

const buildDetailsTableHtml = (payload) => `
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
    <tr><th align="left">Field</th><th align="left">Value</th></tr>
    <tr><td>First name</td><td>${payload.firstName || ''}</td></tr>
    <tr><td>Last name</td><td>${payload.lastName || ''}</td></tr>
    <tr><td>Email</td><td>${payload.email || ''}</td></tr>
    <tr><td>Country</td><td>${payload.country || ''}</td></tr>
    <tr><td>Phone</td><td>${payload.phone || ''}</td></tr>
    <tr><td>Company</td><td>${payload.company || ''}</td></tr>
    <tr><td>Company size</td><td>${payload.companySize || ''}</td></tr>
    <tr><td>Job title</td><td>${payload.jobTitle || ''}</td></tr>
    <tr><td>Topic</td><td>${payload.topic || ''}</td></tr>
    <tr><td>Comments</td><td>${payload.comments || ''}</td></tr>
    <tr><td>Marketing opt-in</td><td>${payload.marketingOptIn ? 'Yes' : 'No'}</td></tr>
  </table>
`;

const sendContactNotification = async (payload) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [CONTACT_NOTIFICATION_EMAIL],
      subject: `New Contact Us Submission - ${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
      html: `
        <p>A new Contact Us form was submitted.</p>
        ${buildDetailsTableHtml(payload)}
      `,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Contact notification mail failed (${response.status}): ${errText}`);
  }
};

const createQuery = async (payload) => {
  const saved = await queryRepository.createQuery(payload);
  try {
    await sendContactNotification(payload);
  } catch (_error) {
    // Keep form submission successful even if mail provider fails.
  }
  return saved;
};

const getQueries = async () => queryRepository.getQueries();

const getQueryById = async (id) => {
  const query = await queryRepository.getQueryById(id);
  if (!query) {
    throw new AppError('Client query not found', 404);
  }
  return query;
};

module.exports = {
  createQuery,
  getQueries,
  getQueryById,
};
