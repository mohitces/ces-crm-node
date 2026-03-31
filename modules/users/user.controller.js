const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { uploadBuffer } = require('../../utils/cloudinary');

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
});

const createUser = asyncHandler(async (req, res) => {
  const created = await userService.createUser(req.body);
  res.status(201).json(created);
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'Profile image is required.' });
    return;
  }
  const upload = await uploadBuffer(file.buffer, {
    folder: 'ces/users',
    resource_type: 'image',
  });
  res.status(201).json({ url: upload.secure_url });
});

const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUser(req.params.id, req.body);
  res.json(updated);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  uploadProfileImage,
  updateUser,
  deleteUser,
};
