import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/product/paymentModel.js';
import Order from '../models/product/orderModel.js';
import asyncHandler from 'express-async-handler';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;
  
  if (!amount || !orderId) {
    res.status(400);
    throw new Error('Amount and orderId are required');
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency: "INR",
    receipt: orderId,
  };

  const order = await razorpay.orders.create(options);

  if (!order) {
    res.status(500);
    throw new Error('Failed to create Razorpay order');
  }

  res.status(200).json({
    success: true,
    order
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    orderId 
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    res.status(400);
    throw new Error('Missing required payment verification parameters');
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  // Update order status
  const updatedOrder = await Order.findOneAndUpdate(
    { orderId: orderId },
    { 
      'payment.status': 'completed',
      'payment.transactionId': razorpay_payment_id,
      orderStatus: 'Processing'
    },
    { new: true }
  );

  if (!updatedOrder) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Create payment record
  const payment = await Payment.create({
    userId: req.user._id, // Add user ID from auth middleware
    orderId,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    amount: req.body.amount,
    status: 'completed',
    checkoutId: updatedOrder._id
  });

  if (!payment) {
    res.status(500);
    throw new Error('Failed to create payment record');
  }

  res.status(200).json({
    success: true,
    message: "Payment verified successfully"
  });
}); 