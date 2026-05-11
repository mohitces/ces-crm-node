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
  </table>
`;

const INTERNAL_NOTIFICATION_EMAIL = 'info@ces-pl.com';

const sendViaResend = async (payload, pdfPath) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.COMPANY_PROFILE_FROM_EMAIL || 'onboarding@resend.dev';
  const resendTestRecipient = process.env.RESEND_TEST_RECIPIENT;
  if (!resendApiKey) {
    return { emailed: false, emailedToUser: false, emailedToInfo: false, message: 'RESEND_API_KEY is not configured on the server.' };
  }

  const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');
  const userHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for your interest in CES Tech. Please find your company profile PDF attached.</p>
    <p>Here are the details you submitted:</p>
    ${buildDetailsTableHtml(payload)}
  `;
  const infoHtml = `
    <p>A new company profile request has been submitted.</p>
    ${buildDetailsTableHtml(payload)}
  `;

  const sendMail = async (to, subject, html, includeAttachment) => {
    const body = {
      from,
      to: [to],
      subject,
      html,
    };
    if (includeAttachment) {
      body.attachments = [{ filename: 'CES-Company-Profile.pdf', content: pdfBase64 }];
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API failed (${response.status}): ${errText}`);
    }
  };

  let emailedToUser = false;
  let userError = '';
  const userTarget = resendTestRecipient || payload.email;

  try {
    await sendMail(userTarget, 'Your CES Tech Company Profile', userHtml, true);
    emailedToUser = true;
  } catch (error) {
    userError = error?.message || 'Failed to send user email via Resend.';
  }

  let emailedToInfo = false;
  let infoError = '';
  try {
    await sendMail(INTERNAL_NOTIFICATION_EMAIL, `New Company Profile Request - ${payload.firstName} ${payload.lastName}`, infoHtml, false);
    emailedToInfo = true;
  } catch (error) {
    infoError = error?.message || 'Failed to send internal notification via Resend.';
  }

  if (emailedToUser && emailedToInfo) {
    return { emailed: true, emailedToUser: true, emailedToInfo: true, message: 'Company profile sent successfully via Resend.' };
  }

  const messageParts = [];
  if (userError) messageParts.push(userError);
  if (infoError) messageParts.push(infoError);
  return {
    emailed: emailedToUser || emailedToInfo,
    emailedToUser,
    emailedToInfo,
    message: messageParts.join(' | ') || 'Email send partially failed.',
  };
};

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

  if (process.env.RESEND_API_KEY) {
    return sendViaResend(payload, pdfPath);
  }

  return sendViaSmtp(payload, pdfPath);
};

const createCompanyProfileRequest = async (payload) => {
  const saved = await companyProfileRepository.createRequest(payload);
  try {
    const result = await sendCompanyProfileEmail(payload);
    await companyProfileRepository.updateRequestById(saved._id, {
      emailedToUser: !!result.emailedToUser,
      emailedToInfo: !!result.emailedToInfo,
      emailError: result.emailed ? '' : (result.message || ''),
    });
    return { ...result, requestId: saved._id };
  } catch (error) {
    await companyProfileRepository.updateRequestById(saved._id, {
      emailedToUser: false,
      emailedToInfo: false,
      emailError: error?.message || 'Email send failed',
    });
    return {
      emailed: false,
      emailedToUser: false,
      emailedToInfo: false,
      message: error?.message || 'Email send failed',
      requestId: saved._id,
    };
  }
};

const getSamplePdfPath = () => {
  const pdfPath = resolvePdfPath();
  if (!pdfPath) {
    throw new AppError('Company profile PDF not found', 404);
  }
  return pdfPath;
};

module.exports = {
  createCompanyProfileRequest,
  getSamplePdfPath,
};
