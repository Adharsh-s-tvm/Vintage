import asyncHandler from '../../middlewares/asyncHandler.js';
import Order from '../../models/product/orderModel.js';
import Cart from '../../models/product/cartModel.js';
import Address from '../../models/userAddressModel.js';
import Variant from '../../models/product/sizeVariantModel.js';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Coupon from '../../models/product/couponModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createOrder = asyncHandler(async (req, res) => {
    const { addressId, paymentMethod, couponCode } = req.body;
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
    const address = await Address.findById(addressId);
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

        // Use discountPrice if available, otherwise use regular price
        const itemPrice = variant.discountPrice || variant.price;
        const itemTotal = item.quantity * itemPrice;
        subtotal += itemTotal;

        orderItems.push({
            product: item.variant.product._id,
            sizeVariant: item.variant._id,
            quantity: item.quantity,
            price: variant.price, // Original price
            discountPrice: variant.discountPrice || variant.price, // Store discount price
            finalPrice: itemTotal,
            status: 'pending'
        });
    }

    // 4. Calculate totals
    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    let couponDiscount = 0;
    let appliedCoupon = null;

    // If coupon is provided, validate and calculate discount
    if (couponCode) {
        appliedCoupon = await Coupon.findOne({
            couponCode,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
            isExpired: false,
            usedBy: { $nin: [userId] }
        });

        if (appliedCoupon) {
            // Calculate coupon discount
            if (appliedCoupon.discountType === 'percentage') {
                couponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
            } else {
                couponDiscount = appliedCoupon.discountValue;
            }
        }
    }

    // Calculate final amounts
    const finalSubtotal = subtotal - couponDiscount;
    const finalTotal = finalSubtotal + shippingCost;

    // Inside createOrder function, after calculating coupon discount
    const orderItemsWithDiscount = orderItems.map(item => {
        const itemShare = item.finalPrice / subtotal;
        const itemCouponDiscount = couponDiscount * itemShare;
        const finalPriceAfterCoupon = item.finalPrice - itemCouponDiscount;

        return {
            product: item.product,
            sizeVariant: item.sizeVariant,
            quantity: item.quantity,
            price: item.price,
            discountPrice: item.discountPrice,
            finalPrice: finalPriceAfterCoupon,
            savedAmount: (item.price * item.quantity) - finalPriceAfterCoupon,
            status: 'pending'
        };
    });

    const orderId = generateOrderId();

    // 5. Create order
    const order = new Order({
        user: userId,
        cart: cart._id,
        items: orderItemsWithDiscount,
        shipping: {
            address: {
                fullName: address.fullName,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country || 'India',
                postalCode: address.postalCode
            },
            shippingMethod: "Standard",
            deliveryCharge: shippingCost
        },
        payment: {
            method: paymentMethod,
            status: paymentMethod === 'cod' ? 'pending' : 'initiated',
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
            amount: finalTotal
        },
        shippingAddress: addressId,
        paymentMethod,
        subtotal: finalSubtotal,
        shippingCost,
        total: finalTotal,
        totalAmount: finalTotal,
        orderId: orderId,
        couponCode: appliedCoupon ? couponCode : null,
        discountAmount: couponDiscount,
        totalDiscount: orderItemsWithDiscount.reduce((acc, item) => {
            const originalTotal = item.price * item.quantity;
            return acc + (originalTotal - item.finalPrice);
        }, 0)
    });

    try {
        // Save the order first
        await order.save();

        // Update stock for each item after order is saved
        for (const item of orderItemsWithDiscount) {
            await Variant.findByIdAndUpdate(
                item.sizeVariant,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        // If coupon was applied successfully, add user to usedBy array
        if (appliedCoupon) {
            await Coupon.findByIdAndUpdate(appliedCoupon._id, {
                $push: { usedBy: userId }
            });
        }

        return res.status(201).json({
            message: 'Order placed successfully',
            orderId: orderId,
            totalAmount: order.totalAmount,
            totalDiscount: order.totalDiscount
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
    .populate({
        path: 'items.product',
        select: 'name images'
    })
    .populate({
        path: 'items.sizeVariant',
        select: 'size color price mainImage subImages'
    })
    .populate({
        path: 'shipping.address',
        select: 'fullName street city state postalCode phone'
    });

    if (order) {
        res.json({
            success: true,
            order
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Order not found'
        });
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

    // Check if order status is Delivered
    if (order.orderStatus !== 'Delivered') {
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

export const pdfDownloader = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // Fetch order details with populated fields
    const order = await Order.findOne({ orderId })
        .populate('user', 'firstname lastname email')
        .populate('items.product', 'name')
        .populate('items.sizeVariant', 'size color price')
        .populate('shipping.address');

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../invoices/invoice-${orderId}.pdf`);

    // Ensure the invoices directory exists
    if (!fs.existsSync(path.join(__dirname, '../invoices'))) {
        fs.mkdirSync(path.join(__dirname, '../invoices'));
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add invoice details
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Order ID: ${order.orderId}`);
    doc.text(`Customer: ${order.user.firstname} ${order.user.lastname}`);
    doc.text(`Email: ${order.user.email}`);
    doc.moveDown();

    // Add shipping address
    doc.fontSize(14).text("Shipping Address:");
    doc.fontSize(12)
        .text(order.shipping.address.fullName)
        .text(order.shipping.address.street)
        .text(`${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.postalCode}`)
        .text(`Phone: ${order.shipping.address.phone}`);
    doc.moveDown();

    // Add order items
    doc.fontSize(14).text("Order Items:");
    order.items.forEach((item, index) => {
        doc.fontSize(12).text(
            `${index + 1}. ${item.product.name} - ${item.sizeVariant.size}/${item.sizeVariant.color}`,
            { continued: true }
        );
        doc.text(
            `   Qty: ${item.quantity} x ₹${item.price} = ₹${item.finalPrice}`,
            { align: 'right' }
        );
    });

    doc.moveDown();
    // Add totals
    doc.fontSize(14)
        .text(`Subtotal: ₹${order.totalAmount - order.shipping.deliveryCharge}`, { align: 'right' })
        .text(`Shipping: ₹${order.shipping.deliveryCharge}`, { align: 'right' })
        .text(`Total: ₹${order.totalAmount}`, { align: 'right' });

    doc.end();

    stream.on("finish", () => {
        res.download(filePath, `invoice-${order.orderId}.pdf`, (err) => {
            if (err) {
                console.error("Download error:", err);
                res.status(500).json({ message: "Error downloading invoice" });
            }
            // Delete file after download
            fs.unlinkSync(filePath);
        });
    }); // Add this closing brace for pdfDownloader function

});

const calculateReturnAmount = (orderItem, order) => {
  // Get the original item price and quantity
  const originalItemTotal = orderItem.price * orderItem.quantity;
  
  // Calculate product discount
  const productDiscount = orderItem.price - orderItem.discountPrice;
  const totalProductDiscount = productDiscount * orderItem.quantity;
  
  // Calculate proportional coupon discount if coupon was applied
  let couponDiscountShare = 0;
  if (order.couponCode && order.discountAmount > 0) {
    // Calculate this item's share of the total coupon discount
    const itemSharePercentage = orderItem.finalPrice / order.subtotal;
    couponDiscountShare = order.discountAmount * itemSharePercentage;
  }
  
  // Calculate final return amount
  const returnAmount = originalItemTotal - totalProductDiscount - couponDiscountShare;
  
  return {
    returnAmount,
    productDiscount: totalProductDiscount,
    couponDiscountShare
  };
};

export const processReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const orderItem = order.items.find(item => item._id.toString() === itemId);
    if (!orderItem) {
      return res.status(404).json({ message: 'Order item not found' });
    }
    
    // Calculate return amounts
    const { returnAmount, productDiscount, couponDiscountShare } = calculateReturnAmount(orderItem, order);
    
    // Update revenue records
    await updateRevenue(-returnAmount);
    
    // Update order totals
    order.totalAmount -= returnAmount;
    order.totalDiscount -= (productDiscount + couponDiscountShare);
    if (order.couponCode) {
      order.discountAmount -= couponDiscountShare;
    }
    
    // Update item status
    orderItem.status = 'Returned';
    await order.save();
    
    res.json({
      message: 'Return processed successfully',
      returnAmount,
      updatedOrder: order
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};