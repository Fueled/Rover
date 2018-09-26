var express = require('express');
var router = express.Router();
var ProjectController = require('../controllers/ProjectController.js');

/*
 * GET
 */
router.get('/', ProjectController.list);

/*
 * GET
 */
router.get('/:id', ProjectController.show);

/*
 * POST
 */
router.post('/', ProjectController.create);

/*
 * PUT
 */
router.put('/:id', ProjectController.update);

/*
 * DELETE
 */
router.delete('/:id', ProjectController.remove);

module.exports = router;
