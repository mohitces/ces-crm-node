const fs = require('fs');
const path = require('path');
const AppError = require('../../utils/AppError');
const companyProfileRepository = require('./company-profile.repository');

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (_error) {
  nodemailer = null;
}

const resolvePdfPath = () => {
  const candidates = [
    path.join(__dirname, '..', '..', '..', 'CES-website-ng', 'src', 'assets', 'company profile pdf.pdf'),
    path.join(__dirname, '..', '..', 'assets', 'company profile pdf.pdf'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

const buildDetailsTableHtml = (payload) => `
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
    <tr><th align="left">Field</th><th align="left">Value</th></tr>
    <tr><td>First name</td><td>${payload.firstName}</td></tr>
    <tr><td>Last name</td><td>${payload.lastName}</td></tr>
    <tr><td>Phone number</td><td>${payload.phone}</td></tr>
    <tr><td>Email address</td><td>${payload.email}</td></tr>
    <tr><td>Company name</td><td>${payload.companyName}</td></tr>
    <tr><td>Message</td><td>${payload.message || '-'}</td></tr>
  </table>
`;

const INTERNAL_NOTIFICATION_EMAIL = 'jhanaksharmaaa@gmail.com';

const sendViaSmtp = async (payload, pdfPath) => {
  if (!nodemailer) {
    return { emailed: false, message: 'Email service dependency is missing (nodemailer not installed).', emailedToUser: false, emailedToInfo: false };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || user;
  if (!host || !user || !pass || !from) {
    return { emailed: false, message: 'SMTP is not configured on the server.', emailedToUser: false, emailedToInfo: false };
  }
  if (pass === 'YOUR_MAIL_PASSWORD_OR_APP_PASSWORD') {
    return {
      emailed: false,
      emailedToUser: false,
      emailedToInfo: false,
      message: 'SMTP password is placeholder. Please set real SMTP_PASS in backend .env.',
    };
  }
  if (!pdfPath) {
    return { emailed: false, message: 'Company profile PDF file was not found on server.', emailedToUser: false, emailedToInfo: false };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const html = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for your interest in CES Tech. Please find your company profile PDF attached.</p>
    <p>Here are the details you submitted:</p>
    ${buildDetailsTableHtml(payload)}
  `;

  await transporter.sendMail({
    from,
    to: payload.email,
    subject: 'Your CES Tech Company Profile',
    html,
    attachments: [
      {
        filename: 'CES-Company-Profile.pdf',
        path: pdfPath,
      },
    ],
  });

  await transporter.sendMail({
    from,
    to: INTERNAL_NOTIFICATION_EMAIL,
    subject: `New Company Profile Request - ${payload.firstName} ${payload.lastName}`,
    html: `
      <p>A new company profile request has been submitted.</p>
      ${buildDetailsTableHtml(payload)}
    `,
  });

  return { emailed: true, message: 'Company profile sent successfully.', emailedToUser: true, emailedToInfo: true };
};

const sendCompanyProfileEmail = async (payload) => {
  const pdfPath = resolvePdfPath();
  if (!pdfPath) {
    return { emailed: false, message: 'Company profile PDF file was not found on server.', emailedToUser: false, emailedToInfo: false };
  }

  return sendViaSmtp(payload, pdfPath);
};

const createCompanyProfileRequest = async (payload) => {
  const saved = await companyProfileRepository.createRequest(payload);

  // Do not block API response on SMTP latency.
  Promise.resolve()
    .then(async () => {
      const result = await sendCompanyProfileEmail(payload);
      await companyProfileRepository.updateRequestById(saved._id, {
        emailedToUser: !!result.emailedToUser,
        emailedToInfo: !!result.emailedToInfo,
        emailError: result.emailed ? '' : (result.message || ''),
      });
    })
    .catch(async (error) => {
      await companyProfileRepository.updateRequestById(saved._id, {
        emailedToUser: false,
        emailedToInfo: false,
        emailError: error?.message || 'Email send failed',
      });
    });

  return {
    emailed: true,
    queued: true,
    message: 'Request submitted successfully. Email delivery is in progress.',
    requestId: saved._id,
  };
};

const getSamplePdfPath = () => {
  const pdfPath = resolvePdfPath();
  if (!pdfPath) {
    throw new AppError('Company profile PDF not found', 404);
  }
  return pdfPath;
};

const verifySmtpHealth = async () => {
  if (!nodemailer) {
    return { ok: false, message: 'nodemailer dependency is missing.' };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || user;

  if (!host || !user || !pass || !from) {
    return { ok: false, message: 'SMTP is not fully configured. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, COMPANY_PROFILE_FROM_EMAIL.' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    return { ok: true, message: 'SMTP connection verified successfully.' };
  } catch (error) {
    return { ok: false, message: error?.message || 'SMTP verification failed.' };
  }
};

module.exports = {
  createCompanyProfileRequest,
  getSamplePdfPath,
  verifySmtpHealth,
};
