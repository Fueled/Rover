const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController.js');

/*
 * GET
 */
router.get('/', contractController.list);

/*
 * GET
 */
router.get('/:id', contractController.show);

/*
 * POST
 */
router.post('/', contractController.create);

module.exports = router;
