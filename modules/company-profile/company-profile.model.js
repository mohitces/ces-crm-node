const mongoose = require('mongoose');

const companyProfileRequestSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    message: { type: String, default: '', trim: true },
    emailedToUser: { type: Boolean, default: false },
    emailedToInfo: { type: Boolean, default: false },
    emailError: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyProfileRequest', companyProfileRequestSchema);
