const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByPhone } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:phone', getOrdersByPhone);

module.exports = router;
