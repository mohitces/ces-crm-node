const queryRepository = require('./query.repository');
const AppError = require('../../utils/AppError');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

const CONTACT_NOTIFICATION_EMAIL = process.env.COMPANY_PROFILE_INTERNAL_EMAIL || 'jhanaksharmaaa@gmail.com';

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
  if (!nodemailer) {
    console.error('[Contact Email] nodemailer module not available');
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || user;

  if (!host || !user || !pass) {
    console.error('[Contact Email] SMTP not configured. Missing env vars:', {
      host: !!host, user: !!user, pass: !!pass,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from,
    to: 'jhanaksharmaaa@gmail.com',
    subject: `New Contact Us Submission - ${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
    html: `
      <p>A new Contact Us form was submitted.</p>
      ${buildDetailsTableHtml(payload)}
    `,
  });

  console.log('[Contact Email] Sent to jhanaksharmaaa@gmail.com for:', payload.firstName, payload.lastName);
};

const createQuery = async (payload) => {
  const saved = await queryRepository.createQuery(payload);
  try {
    await sendContactNotification(payload);
  } catch (error) {
    console.error('[Contact Email] Failed to send notification:', error.message);
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

const testEmail = async () => {
  if (!nodemailer) {
    return { ok: false, message: 'nodemailer not installed' };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || user;

  if (!host || !user || !pass) {
    return { ok: false, message: 'SMTP not configured', host: !!host, user: !!user, pass: !!pass };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
  } catch (error) {
    return { ok: false, step: 'verify', message: error.message };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: 'jhanaksharmaaa@gmail.com',
      subject: 'CES Test Email - Contact Form',
      html: '<p>This is a test email from the CES contact form system.</p>',
    });
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    return { ok: false, step: 'send', message: error.message };
  }
};

module.exports = {
  createQuery,
  getQueries,
  getQueryById,
  testEmail,
};
