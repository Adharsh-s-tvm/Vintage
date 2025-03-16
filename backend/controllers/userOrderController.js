import asyncHandler from '../middlewares/asyncHandler.js';
import Order from '../models/orderModel.js';
import Cart from '../models/product/cartModel.js';
import Address from '../models/userAddressModel.js';
import Variant from '../models/product/sizeVariantModel.js';

// @desc    Create new order
// @route   POST /api/user/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
    const { addressId, paymentMethod = 'cod' } = req.body;
    const userId = req.user._id;

    // 1. Get user's cart with populated data
    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: 'items.variant',
            populate: {
                path: 'product',
                populate: ['brand', 'category']
            }
        });

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Verify address
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        return res.status(404).json({ message: 'Delivery address not found' });
    }

    // 3. Create order items and verify stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const variant = await Variant.findById(item.variant._id);

        // Verify product availability
        if (!variant || variant.isBlocked || !variant.product.isListed) {
            return res.status(400).json({
                message: `${item.variant.product.name} is no longer available`
            });
        }

        // Verify stock
        if (variant.stock < item.quantity) {
            return res.status(400).json({
                message: `Insufficient stock for ${item.variant.product.name}`
            });
        }

        // Calculate item total
        const itemTotal = item.quantity * item.variant.price;
        subtotal += itemTotal;

        // Add to order items
        orderItems.push({
            product: item.variant.product._id,
            sizeVariant: item.variant._id,
            quantity: item.quantity,
            price: item.variant.price,
            finalPrice: itemTotal,
            status: 'Processing'
        });

        // Update stock
        variant.stock -= item.quantity;
        await variant.save();
    }

    // 4. Calculate totals
    const shippingCharge = subtotal > 500 ? 0 : 50; // Free shipping over $500
    const totalAmount = subtotal + shippingCharge;

    // 5. Create order
    const order = await Order.create({
        user: userId,
        cart: cart._id,
        items: orderItems,
        shipping: {
            address: addressId,
            shippingMethod: 'Standard',
            deliveryCharge: shippingCharge
        },
        payment: {
            method: paymentMethod,
            status: 'pending',
            transactionId: `TXN${Date.now()}`,
            amount: totalAmount
        },
        orderStatus: 'Processing',
        totalAmount,
    });

    // 6. Clear cart
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({
        message: 'Order placed successfully',
        orderId: order._id
    });
});

// @desc    Get all orders for a user
// @route   GET /api/user/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate({
            path: 'items.variant',
            populate: {
                path: 'product',
                select: 'name images'
            }
        })
        .sort({ createdAt: -1 });

    res.json(orders);
});

// @desc    Get single order by ID
// @route   GET /api/user/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id
    }).populate({
        path: 'items.variant',
        populate: {
            path: 'product',
            populate: ['brand', 'category']
        }
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
});

// @desc    Cancel order
// @route   PUT /api/user/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['Processing', 'Confirmed'].includes(order.status)) {
        return res.status(400).json({
            message: 'Order cannot be cancelled at this stage'
        });
    }

    // Restore stock for each item
    for (const item of order.items) {
        const variant = await Variant.findById(item.variant);
        if (variant) {
            variant.stock += item.quantity;
            await variant.save();
        }
    }

    // Update order status
    order.status = 'Cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = Date.now();
    await order.save();

    res.json({
        message: 'Order cancelled successfully',
        order
    });
});

// @desc    Request order return
// @route   PUT /api/user/orders/:id/return
// @access  Private
export const requestReturn = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({
            message: 'Return reason is required'
        });
    }

    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be returned (must be delivered and within 30 days)
    if (order.status !== 'Delivered') {
        return res.status(400).json({
            message: 'Only delivered orders can be returned'
        });
    }

    const deliveryDate = new Date(order.deliveredAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (deliveryDate < thirtyDaysAgo) {
        return res.status(400).json({
            message: 'Return period (30 days) has expired'
        });
    }

    // Update order status
    order.status = 'Return Requested';
    order.returnReason = reason;
    order.returnRequestedAt = Date.now();
    await order.save();

    res.json({
        message: 'Return request submitted successfully',
        order
    });
});
