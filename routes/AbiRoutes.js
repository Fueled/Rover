var express = require('express');
var router = express.Router();
var AbiController = require('../controllers/AbiController.js');

/*
 * GET
 */
router.get('/', AbiController.list);

/*
 * GET
 */
router.get('/:id', AbiController.show);

/*
 * POST
 */
router.post('/', AbiController.create);

/*
 * PUT
 */
router.put('/:id', AbiController.update);

/*
 * DELETE
 */
router.delete('/:id', AbiController.remove);

module.exports = router;
