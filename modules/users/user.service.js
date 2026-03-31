const fs = require('fs');
const path = require('path');
const userRepository = require('./user.repository');
const AppError = require('../../utils/AppError');
const bcrypt = require('bcryptjs');
const { destroyByUrl, isCloudinaryUrl } = require('../../utils/cloudinary');

const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'Pa$$w0rd';
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@ces-pl.com';

const normalizeEmail = (email) => email.toLowerCase().trim();

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || '',
  role: user.role,
  isActive: user.isActive,
  profileImage: user.profileImage || '',
  lastLoginAt: user.lastLoginAt,
  lastLoginIp: user.lastLoginIp,
  mfaEnabled: user.mfaEnabled || false,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildWelcomeEmail = ({ name, email }) => ({
  subject: 'Your CES Admin account has been created',
  body: `Hello ${name},

Your account has been created for CES Admin.

Login email: ${email}
Default password: ${DEFAULT_USER_PASSWORD}

Please log in and change your password after your first sign-in.

Regards,
CES Tech Admin Team`,
});

const getUsers = async () => {
  const users = await userRepository.getUsers({ excludeEmail: DEFAULT_ADMIN_EMAIL });
  return users.map(buildUserResponse);
};

const getUserById = async (id) => {
  const user = await userRepository.getUserById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return buildUserResponse(user);
};

const createUser = async (payload) => {
  const normalizedEmail = normalizeEmail(payload.email);
  const existing = await userRepository.getUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError('A user with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);
  const created = await userRepository.createUser({
    name: payload.name.trim(),
    email: normalizedEmail,
    mobile: payload.mobile?.trim() || '',
    password: hashedPassword,
    role: payload.role?.trim() || 'user',
    isActive: payload.isActive ?? true,
    profileImage: payload.profileImage?.trim() || '',
  });

  return {
    user: buildUserResponse(created),
    welcomeEmail: payload.sendWelcomeEmail === false ? null : buildWelcomeEmail(created),
    message:
      payload.sendWelcomeEmail === false
        ? 'User created successfully'
        : 'User created and welcome email prepared successfully',
  };
};

const updateUser = async (id, payload) => {
  const existing = await userRepository.getUserById(id);
  if (!existing) {
    throw new AppError('User not found', 404);
  }

  if (payload.email) {
    const normalizedEmail = normalizeEmail(payload.email);
    const existing = await userRepository.getUserByEmail(normalizedEmail);
    if (existing && existing._id.toString() !== id) {
      throw new AppError('A user with this email already exists', 409);
    }
    payload.email = normalizedEmail;
  }

  if (typeof payload.name === 'string') {
    payload.name = payload.name.trim();
  }

  if (typeof payload.mobile === 'string') {
    payload.mobile = payload.mobile.trim();
  }

  if (typeof payload.role === 'string') {
    payload.role = payload.role.trim();
  }

  if (typeof payload.profileImage === 'string') {
    payload.profileImage = payload.profileImage.trim();
    if (payload.profileImage !== existing.profileImage) {
      await removeProfileImage(existing.profileImage);
    }
  }

  delete payload.sendWelcomeEmail;

  const updated = await userRepository.updateUser(id, payload);
  return {
    user: buildUserResponse(updated),
    message: 'User updated successfully',
  };
};

const deleteUser = async (id) => {
  const existing = await userRepository.getUserById(id);
  if (!existing) {
    throw new AppError('User not found', 404);
  }
  await removeProfileImage(existing.profileImage);
  await userRepository.deleteUser(id);
};

const removeProfileImage = async (imageUrl) => {
  if (!imageUrl) return;
  if (isCloudinaryUrl(imageUrl)) {
    await destroyByUrl(imageUrl);
    return;
  }
  const marker = '/uploads/users/';
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;
  const relative = imageUrl.slice(index);
  const filePath = path.join(__dirname, '../../', relative);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
