const asyncHandler = require('../../utils/asyncHandler');
const queryService = require('./query.service');

const createQuery = asyncHandler(async (req, res) => {
  const query = await queryService.createQuery(req.body);
  res.status(201).json(query);
});

const getQueries = asyncHandler(async (_req, res) => {
  const queries = await queryService.getQueries();
  res.json(queries);
});

const getQueryById = asyncHandler(async (req, res) => {
  const query = await queryService.getQueryById(req.params.id);
  res.json(query);
});

const testEmail = asyncHandler(async (_req, res) => {
  const result = await queryService.testEmail();
  res.json(result);
});

module.exports = {
  createQuery,
  getQueries,
  getQueryById,
  testEmail,
};
