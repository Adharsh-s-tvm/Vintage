import asyncHandler from '../middlewares/asyncHandler.js';
import Order from '../models/product/orderModel.js';
import Cart from '../models/product/cartModel.js';
import Address from '../models/userAddressModel.js';
import Variant from '../models/product/sizeVariantModel.js';

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

        // Update stock
        variant.stock -= item.quantity;
        await variant.save();
    }

    // 4. Calculate totals
    const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over $500
    const total = subtotal + shippingCost;

    // 5. Create order
    const order = new Order({
        user: userId,
        cart: cart._id,
        items: orderItems,
        shipping: {
            address: addressId,
            shippingMethod: "Standard", // Changed from "Standard Delivery" to match enum
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
        orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    });

    await order.save();

    // 6. Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
        message: 'Order created successfully',
        orderId: order.orderId
    });
});

// Get all orders for a user
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product')
        .populate('items.sizeVariant')
        .populate('shippingAddress')
        .sort({ createdAt: -1 });

    res.json(orders);
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
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        orderId: req.params.id,
        user: req.user._id
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if order is already cancelled
    if (order.items.every(item => item.status === 'Cancelled')) {
        res.status(400);
        throw new Error('Order is already cancelled');
    }

    // Check if order can be cancelled (only pending or processing orders)
    const nonCancellableItems = order.items.filter(item => 
        !['pending', 'Processing'].includes(item.status)
    );

    if (nonCancellableItems.length > 0) {
        res.status(400);
        throw new Error('Some items cannot be cancelled at this stage');
    }

    // Update order items status and restore stock
    for (const item of order.items) {
        // Restore stock
        const variant = await Variant.findById(item.sizeVariant);
        if (variant) {
            variant.stock += item.quantity;
            await variant.save();
        }

        // Update item status
        item.status = 'Cancelled';
        if (req.body.cancellationReason) {
            item.cancellationReason = req.body.cancellationReason;
        }
    }

    await order.save();

    res.json({
        message: 'Order cancelled successfully',
        order
    });
});
