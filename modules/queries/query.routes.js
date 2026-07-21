const express = require('express');
const queryController = require('./query.controller');
const validate = require('../../middlewares/validate');
const requireAuth = require('../../middlewares/auth');
const { queryIdParamsSchema, createQuerySchema } = require('./query.validation');

const router = express.Router();

router.get('/test-email', queryController.testEmail);
router.post('/', validate(createQuerySchema), queryController.createQuery);
router.get('/', requireAuth, queryController.getQueries);
router.get('/:id', requireAuth, validate(queryIdParamsSchema, 'params'), queryController.getQueryById);

module.exports = router;
