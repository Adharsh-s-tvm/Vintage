import asyncHandler from '../middlewares/asyncHandler.js';
import Order from '../models/product/orderModel.js';
import Cart from '../models/product/cartModel.js';
import Address from '../models/userAddressModel.js';
import Variant from '../models/product/sizeVariantModel.js';
import mongoose from 'mongoose';

export const createOrder = asyncHandler(async (req, res) => {
    const { addressId, paymentMethod } = req.body;
    const userId = req.user._id;

    // 1. Get user's cart
    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: 'items.variant',
            populate: {
                path: 'product',
                populate: ['brand', 'category']
            }
        });

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
    }

    // 2. Verify address
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        res.status(404);
        throw new Error('Delivery address not found');
    }

    // Generate unique order ID
    const generateOrderId = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD-${year}${month}${day}-${random}`;
    };

    // 3. Create order items and verify stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const variant = await Variant.findById(item.variant._id);
        
        // Check product availability
        if (!variant || variant.isBlocked || variant.product.isBlocked) {
            res.status(400);
            throw new Error(`${item.variant.product.name} is no longer available`);
        }

        // Check stock
        if (variant.stock < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${item.variant.product.name}`);
        }

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

    // 4. Calculate totals
    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    const orderId = generateOrderId();

    // 5. Create order
    const order = new Order({
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
            status: paymentMethod === 'cod' ? 'pending' : 'initiated',
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
            amount: total
        },
        shippingAddress: addressId,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        totalAmount: total,
        orderId: orderId
    });

    try {
        // Save the order first
        await order.save();

        // Update stock for each item after order is saved
        for (const item of orderItems) {
            await Variant.findByIdAndUpdate(
                item.sizeVariant,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        return res.status(201).json({
            message: 'Order placed successfully',
            orderId: orderId
        });

    } catch (error) {
        // Rollback order if something fails
        if (order._id) {
            await Order.findByIdAndDelete(order._id);
        }
        throw error;
    }
});

// Get all orders for a user with pagination and sorting
// Get user orders with efficient pagination and sorting
export const getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user._id;

    try {
        const orders = await Order.find({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name images brand category',
                populate: [
                    { path: 'brand', select: 'name' },
                    { path: 'category', select: 'name' }
                ]
            })
            .populate({
                path: 'items.sizeVariant',
                select: 'size color price stock mainImage subImages',
            })
            .populate({
                path: 'shipping.address',
                select: 'fullName phone street city state country postalCode'
            })
            .populate('user', 'firstname lastname email phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments({ user: userId });

        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to fetch orders",
            error: error.message 
        });
    }
});

// Get single order
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        orderId: req.params.id,
        user: req.user._id
    })
        .populate('items.product')
        .populate('items.sizeVariant')
        .populate('shippingAddress');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Get reason from request body
    const userId = req.user._id;

    const order = await Order.findOne({ 
      orderId: id,
      user: userId 
    }).populate('items.sizeVariant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    const allowedStatuses = ['pending', 'Processing'];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    try {
      // Start a session for transaction
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        // Update order status and reason
        order.orderStatus = 'Cancelled';
        order.reason = reason; // Save cancellation reason
        
        // Update all items status to cancelled and restore stock
        order.items = order.items.map(item => ({
          ...item,
          status: 'Cancelled',
          cancellationReason: reason // Save reason for each item
        }));

        // Restore stock for each variant
        for (const item of order.items) {
          await Variant.findByIdAndUpdate(
            item.sizeVariant._id,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        await order.save({ session });
      });

      await session.endSession();

      res.json({ 
        message: 'Order cancelled successfully',
        order 
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error('Failed to cancel order and restore stock');
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      message: 'Error cancelling order',
      error: error.message 
    });
  }
};

// Return order
export const returnOrder = asyncHandler(async (req, res) => {
    const { reason, additionalDetails } = req.body;
    
    const order = await Order.findOne({
        orderId: req.params.id,
        user: req.user._id
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if order is delivered
    if (!order.items.every(item => item.status === 'Delivered')) {
        res.status(400);
        throw new Error('Order must be delivered before requesting return');
    }

    // Check if return is already requested
    if (order.items.some(item => item.returnRequested)) {
        res.status(400);
        throw new Error('Return already requested for this order');
    }

    // Update order items status
    for (const item of order.items) {
        item.returnRequested = true;
        item.returnReason = reason;
        item.additionalDetails = additionalDetails;
        item.returnStatus = 'Return Pending';
    }

    await order.save();

    res.json({
        message: 'Return request submitted successfully',
        order
    });
});
