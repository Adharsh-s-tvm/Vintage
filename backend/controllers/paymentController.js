import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/product/paymentModel.js';
import Order from '../models/product/orderModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Variant from '../models/product/sizeVariantModel.js';
import Cart from '../models/product/cartModel.js';
import VariantModel from '../models/product/sizeVariantModel.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to generate order ID
const generateOrderId = () => {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Helper function to create order
const createOrder = async (orderData, session) => {
  const { userId, addressId, paymentMethod } = orderData;

  // Get user's cart
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.variant',
      populate: {
        path: 'product',
        select: 'name isBlocked'
      }
    });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  let subtotal = 0;
  const orderItems = [];

  // Process cart items
  for (const item of cart.items) {
    const variant = await VariantModel.findById(item.variant._id).session(session);
    
    if (!variant || variant.isBlocked || variant.product.isBlocked) {
      throw new Error(`${item.variant.product.name} is no longer available`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.variant.product.name}`);
    }

    // Reduce stock
    await VariantModel.findByIdAndUpdate(
      variant._id,
      { $inc: { stock: -item.quantity } },
      { session }
    );

    const itemTotal = item.quantity * variant.price;
    subtotal += itemTotal;

    orderItems.push({
      product: item.variant.product._id,
      sizeVariant: item.variant._id,
      quantity: item.quantity,
      price: variant.price,
      finalPrice: itemTotal,
      status: 'pending'
    });
  }

  // Calculate totals
  const shippingCost = subtotal > 500 ? 0 : 50;
  const total = subtotal + shippingCost;
  const orderId = generateOrderId();

  // Create new order
  const order = await Order.create([{
    user: userId,
    cart: cart._id,
    items: orderItems,
    shipping: {
      address: addressId,
      shippingMethod: "Standard",
      deliveryCharge: shippingCost
    },
    payment: {
      method: paymentMethod,
      status: 'completed',
      transactionId: orderData.razorpayPaymentId || `TXN${Date.now()}`,
      amount: total
    },
    shippingAddress: addressId,
    paymentMethod,
    subtotal,
    shippingCost,
    total,
    totalAmount: total,
    orderId: orderId,
    orderStatus: 'Processing'
  }], { session });

  // Clear cart
  await Cart.findByIdAndUpdate(
    cart._id,
    { $set: { items: [] } },
    { session }
  );

  return order[0];
};

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, addressId, paymentMethod } = req.body;
  
  if (!amount || !addressId) {
    res.status(400);
    throw new Error('Amount and address are required');
  }

  // Create Razorpay order
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `tmp_${Date.now()}`
  };

  const razorpayOrder = await razorpay.orders.create(options);

  if (!razorpayOrder) {
    res.status(500);
    throw new Error('Failed to create Razorpay order');
  }

  // Store temporary order details in session or temporary collection
  const tempOrder = {
    addressId,
    paymentMethod,
    amount,
    userId: req.user._id
  };

  // You can store this in Redis or a temporary collection
  // For now, we'll store it in the payment document
  const tempPayment = await Payment.create({
    userId: req.user._id,
    orderId: razorpayOrder.id,
    amount: amount,
    status: 'created',
    tempOrderData: tempOrder
  });

  res.status(200).json({
    success: true,
    order: razorpayOrder,
    tempOrderId: tempPayment._id
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    tempOrderId,
    amount,
    addressId,
    paymentMethod
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing required payment parameters');
  }

  try {
    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      res.status(400);
      throw new Error('Invalid payment signature');
    }

    const session = await mongoose.startSession();
    let order;

    try {
      await session.withTransaction(async () => {
        // Create the order
        order = await createOrder({
          userId: req.user._id,
          addressId,
          paymentMethod,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        }, session);

        // Update payment record
        await Payment.findByIdAndUpdate(
          tempOrderId,
          {
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'completed',
            orderId: order.orderId,
            checkoutId: order._id
          },
          { session }
        );
      });

      await session.endSession();

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        orderId: order.orderId
      });
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

export const cancelPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Update order status
      const order = await Order.findOneAndUpdate(
        { orderId: orderId },
        { 
          'payment.status': 'cancelled',
          orderStatus: 'Cancelled',
          reason: 'Payment failed or cancelled'
        },
        { new: true, session }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      // Restore stock for each item
      for (const item of order.items) {
        await Variant.findByIdAndUpdate(
          item.sizeVariant,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      // Create payment record
      await Payment.create([{
        userId: req.user._id,
        orderId,
        status: 'cancelled',
        amount: order.totalAmount,
        checkoutId: order._id,
        error: 'Payment cancelled or failed'
      }], { session });
    });

    await session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment cancelled and order reversed successfully"
    });
  } catch (error) {
    await session.endSession();
    res.status(500);
    throw new Error(error.message);
  }
});

export const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { orderId, paymentId, error } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }

  // Update order status
  const updatedOrder = await Order.findOneAndUpdate(
    { orderId: orderId },
    { 
      'payment.status': 'failed',
      'payment.transactionId': paymentId || 'FAILED',
      orderStatus: 'Cancelled'
    },
    { new: true }
  );

  if (!updatedOrder) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Create payment record for failure
  await Payment.create({
    userId: req.user._id,
    orderId,
    paymentId: paymentId || 'FAILED',
    status: 'failed',
    amount: updatedOrder.totalAmount,
    checkoutId: updatedOrder._id,
    error: error ? JSON.stringify(error) : 'Payment failed'
  });

  res.status(200).json({
    success: true,
    message: "Payment failure recorded successfully"
  });
}); 