const Order = require('../models/orderModel');

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ORDERS BY PHONE
const getOrdersByPhone = async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).populate('flowers.flowerId');
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: 'Invalid request' });
  }
};

module.exports = { createOrder, getOrdersByPhone };
