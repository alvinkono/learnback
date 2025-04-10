const express = require('express');
const router = express.Router();
const { initiateStkPush } = require('../controllers/mpesaController');

router.post('/stk', initiateStkPush);

module.exports = router;
