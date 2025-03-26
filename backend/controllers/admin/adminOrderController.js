import Order from "../../models/product/orderModel.js";
import mongoose from "mongoose";
import Variant from "../../models/product/sizeVariantModel.js";
import { processReturnRefund } from '../user/userWalletController.js';

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
  console.log("updateReturnStatus called");
  
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

// Add this new controller function
// Add this function to get return requests
export const getReturnRequests = async (req, res) => {
  console.log("Return called");
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {
      'items': {
        $elemMatch: {
          'returnRequested': true
        }
      }
    };

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'user.fullname': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);

    const returns = await Order.find(query)
      .populate('user', 'fullname email')
      .populate({
        path: 'items.product',
        select: 'name images'
      })
      .populate('items.sizeVariant')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      returns,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in getReturnRequests:', error);
    res.status(500).json({
      message: "Failed to fetch return requests",
      error: error.message
    });
  }
};

// Add this controller function for handling return requests
export const handleReturnRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    const { orderId, itemId } = req.params;
    const { action } = req.body;

    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('items.sizeVariant');
      
    if (!order) {
      throw new Error('Order not found');
    }

    const item = order.items.id(itemId);
    if (!item) {
      throw new Error('Order item not found');
    }

    if (action === 'accept') {
      item.returnStatus = 'Return Approved';
      item.status = 'Returned';
      
      // Update inventory
      await Variant.findByIdAndUpdate(
        item.sizeVariant,
        { $inc: { stock: item.quantity } },
        { session }
      );

      // Process refund for online payments
      if (order.payment.method) {
        // Calculate refund amount for this item
        const refundAmount = order.totalAmount; // Use the final price of the item
        
        // Process refund to wallet
        const refundSuccess = await processReturnRefund(
          order.orderId,
          order.user,
          refundAmount,
          `Refund for returned item from order #${order.orderId}`,
          session
        );

        if (!refundSuccess) {
          throw new Error('Failed to process refund to wallet');
        }

        item.returnProcessed = true;
        item.returnStatus = 'Refunded';
      }
    } else if (action === 'reject') {
      item.returnStatus = 'Return Rejected';
    }

    await order.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      message: `Return request ${action}ed successfully`,
      order
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Error in handleReturnRequest:', error);
    res.status(500).json({ 
      message: "Failed to handle return request",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

const handleReturnAction = async (orderId, itemId, action) => {
  try {
    const response = await axios.put(
      `${api}/admin/orders/${orderId}/items/${itemId}/return`,
      { action },
      { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
    );
    
    if (response.data) {
      toast.success(`Return request ${action}ed successfully`);
      fetchReturns();
    } else {
      toast.error(`Failed to ${action} return request`);
    }
  } catch (error) {
    console.error('Action error:', error);
    toast.error(error.response?.data?.message || `Failed to ${action} return request`);
  }
};