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

const INTERNAL_NOTIFICATION_EMAIL = process.env.COMPANY_PROFILE_INTERNAL_EMAIL || process.env.SMTP_USER || '';

const sendViaSmtp = async (payload, pdfPath) => {
  if (!nodemailer) {
    return { emailed: false, message: 'Email service dependency is missing (nodemailer not installed).', emailedToUser: false, emailedToInfo: false };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const rejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || user;
  if (!host || !user || !pass || !from || !INTERNAL_NOTIFICATION_EMAIL) {
    return {
      emailed: false,
      message: 'SMTP is not configured on the server. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, COMPANY_PROFILE_FROM_EMAIL, COMPANY_PROFILE_INTERNAL_EMAIL.',
      emailedToUser: false,
      emailedToInfo: false,
    };
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
    tls: { rejectUnauthorized },
  });

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #0d2b1d, #1a4a2e); padding: 32px 28px 24px; text-align: center;">
        <div style="font-size: 40px; line-height: 1; margin-bottom: 8px;">🎉</div>
        <h1 style="color: #2ecc71; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.3px;">You're all set, ${payload.firstName}!</h1>
      </div>
      <div style="padding: 28px 28px 32px;">
        <p style="font-size: 15px; line-height: 1.6; color: #1e293b; margin: 0 0 16px;">
          Thank you for reaching out to CES Tech. We truly appreciate your interest in our services and solutions. Your request has been successfully received, and we've attached our Company Profile to help you learn more about who we are, what we do, and how we can support your business.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #1e293b; margin: 0 0 16px;">
          One of our solution experts will follow up with you shortly to discuss how CES can support your goals.
        </p>
        <h3 style="font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px;">Your Details</h3>
        ${buildDetailsTableHtml(payload)}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;">
        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
          CES Tech · Building Resilient IT Infrastructure
        </p>
      </div>
    </div>
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
  const rejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || user;
  const internal = process.env.COMPANY_PROFILE_INTERNAL_EMAIL || user;

  if (!host || !user || !pass || !from || !internal) {
    return { ok: false, message: 'SMTP is not fully configured. Required: SMTP_HOST, SMTP_USER, SMTP_PASS, COMPANY_PROFILE_FROM_EMAIL, COMPANY_PROFILE_INTERNAL_EMAIL.' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized },
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
