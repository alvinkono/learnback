const express = require('express');
const router = express.Router();
const { initiateStkPush, handleCallback } = require('../controllers/mpesaController');

router.post('/stk', initiateStkPush);
router.post('/callback', handleCallback);

module.exports = router;
