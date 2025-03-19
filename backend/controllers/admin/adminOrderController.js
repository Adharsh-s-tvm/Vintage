import Order from "../../models/product/orderModel.js";
import mongoose from "mongoose";
import Variant from "../../models/product/sizeVariantModel.js";

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {};
    
    if (search) {
      // First, try to match the exact ObjectId if the search looks like one
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or = [
          { _id: search },
          { 'user.name': { $regex: search, $options: 'i' } }
        ];
      } else {
        query.$or = [
          { 'user.name': { $regex: search, $options: 'i' } }
        ];
      }
    }

    const total = await Order.countDocuments(query);
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('orderId createdAt user totalAmount orderStatus')  // Include orderId in selection
      .lean(); // Convert to plain JavaScript objects

    // Ensure we always send an array
    res.status(200).json({
      orders: orders || [],
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ 
      message: "Failed to fetch orders", 
      error: error.message,
      orders: [] // Always provide an array, even on error
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved } = req.body;

    const order = await Order.findById(orderId).populate('items.sizeVariant');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (approved) {
      // Start a session for transaction
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        // Update order status
        order.orderStatus = 'Returned';
        
        // Update all items status and restore stock
        for (const item of order.items) {
          item.status = 'Returned';
          item.returnStatus = 'Return Approved';
          
          // Restore stock
          await Variant.findByIdAndUpdate(
            item.sizeVariant._id,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        await order.save({ session });
      });

      await session.endSession();
    } else {
      // Reject return request
      order.items = order.items.map(item => ({
        ...item,
        returnStatus: 'Return Rejected'
      }));
      await order.save();
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to update return status", 
      error: error.message 
    });
  }
};