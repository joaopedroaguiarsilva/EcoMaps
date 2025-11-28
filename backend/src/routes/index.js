const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

router.get('/hello', exampleController.hello);

module.exports = router;