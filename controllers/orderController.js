const Order = require('../models/orderModel');
const nodemailer = require('nodemailer');

// Setup email transporter (use your own email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Send email receipt
const sendEmailReceipt = async (order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: 'Your Order Receipt - ProductShop',
    text: `
      Dear ${order.customerName},

      Thank you for your order! Here is your receipt:
      Order ID: ${order._id}
      Products:
      ${order.products.map((product) => `${product.productId.name}: ${product.quantity}`).join('\n')}
      Total: ${order.totalAmount}
      Payment Status: ${order.paymentStatus}

      We will notify you when your order is ready for delivery or pickup.

      Best regards,
      ProductShop Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    await sendEmailReceipt(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ORDERS BY PHONE
const getOrdersByPhone = async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).populate('products.productId');
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: 'Invalid request' });
  }
};

module.exports = { createOrder, getOrdersByPhone };
