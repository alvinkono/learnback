const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }
  ],
  totalAmount: Number,
  paymentStatus: {
    type: String,
    default: 'Pending'
  },
  deliveryOption: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
