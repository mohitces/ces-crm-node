const fs = require('fs');
const path = require('path');
const AppError = require('../../utils/AppError');
const feedbackRepository = require('./feedback.repository');
const { destroyByUrl, isCloudinaryUrl } = require('../../utils/cloudinary');

const getFeedback = async () => feedbackRepository.getFeedback();

const toPublicDto = (feedback) => ({
  id: feedback._id,
  testimonialText: feedback.testimonialText || '',
  type: feedback.type,
  location: feedback.location,
  industry: feedback.industry,
  clientName: feedback.clientName,
  designation: feedback.designation,
  companyName: feedback.companyName,
  profileImage: feedback.profileImage,
  videoUrl: feedback.videoUrl || '',
  thumbnail: feedback.thumbnail || '',
  featured: !!feedback.featured,
  sortOrder: typeof feedback.sortOrder === 'number' ? feedback.sortOrder : 0,
  createdAt: feedback.createdAt,
});

const getPublicFeedback = async () => {
  const feedbackList = await feedbackRepository.getPublicFeedback();
  const featured = feedbackList.filter((item) => item.featured);
  const source = featured.length ? featured : feedbackList;
  return source.map((item) => toPublicDto(item));
};

const removeProfileImage = async (imageUrl) => {
  if (!imageUrl) return;
  if (isCloudinaryUrl(imageUrl)) {
    await destroyByUrl(imageUrl);
    return;
  }
  const marker = '/uploads/feedback/';
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;
  const relative = imageUrl.slice(index);
  const filePath = path.join(__dirname, '../../', relative);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getFeedbackById = async (id) => {
  const feedback = await feedbackRepository.getFeedbackById(id);
  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }
  return feedback;
};

const createFeedback = async (payload) => feedbackRepository.createFeedback(payload);

const updateFeedback = async (id, payload) => {
  const existing = await feedbackRepository.getFeedbackById(id);
  if (!existing) {
    throw new AppError('Feedback not found', 404);
  }

  if (typeof payload.profileImage === 'string') {
    const nextImage = payload.profileImage.trim();
    if (nextImage !== existing.profileImage) {
      await removeProfileImage(existing.profileImage);
    }
    payload.profileImage = nextImage;
  }

  const updated = await feedbackRepository.updateFeedback(id, payload);
  if (!updated) {
    throw new AppError('Feedback not found', 404);
  }
  return updated;
};

const deleteFeedback = async (id) => {
  const existing = await feedbackRepository.getFeedbackById(id);
  if (!existing) {
    throw new AppError('Feedback not found', 404);
  }
  await removeProfileImage(existing.profileImage);
  const deleted = await feedbackRepository.deleteFeedback(id);
  if (!deleted) {
    throw new AppError('Feedback not found', 404);
  }
};

module.exports = {
  getFeedback,
  getPublicFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
