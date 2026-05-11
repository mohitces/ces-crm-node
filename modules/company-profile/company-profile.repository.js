const CompanyProfileRequest = require('./company-profile.model');

const createRequest = async (payload) => {
  const doc = new CompanyProfileRequest(payload);
  return doc.save();
};

const updateRequestById = async (id, updates) =>
  CompanyProfileRequest.findByIdAndUpdate(id, updates, { new: true });

module.exports = {
  createRequest,
  updateRequestById,
};

