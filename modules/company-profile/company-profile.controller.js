const asyncHandler = require('../../utils/asyncHandler');
const companyProfileService = require('./company-profile.service');

const createCompanyProfileRequest = asyncHandler(async (req, res) => {
  const result = await companyProfileService.createCompanyProfileRequest(req.body);
  res.status(200).json(result);
});

const getSamplePdf = asyncHandler(async (_req, res) => {
  const pdfPath = companyProfileService.getSamplePdfPath();
  res.sendFile(pdfPath, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="CES-Company-Profile.pdf"',
    },
  });
});

module.exports = {
  createCompanyProfileRequest,
  getSamplePdf,
};

