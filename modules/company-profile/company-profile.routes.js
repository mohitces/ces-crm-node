const express = require('express');
const validate = require('../../middlewares/validate');
const controller = require('./company-profile.controller');
const { createCompanyProfileRequestSchema } = require('./company-profile.validation');

const router = express.Router();

router.get('/sample-pdf', controller.getSamplePdf);
router.get('/smtp-health', controller.getSmtpHealth);
router.post('/', validate(createCompanyProfileRequestSchema), controller.createCompanyProfileRequest);

module.exports = router;
