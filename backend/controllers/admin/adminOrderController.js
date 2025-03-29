import Order from "../../models/product/orderModel.js";
import mongoose from "mongoose";
import Variant from "../../models/product/sizeVariantModel.js";
import { processReturnRefund } from '../user/userWalletController.js';

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const filter = req.query.filter || 'all';
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order || 'desc';

    // Build filter query
    let filterQuery = {};
    
    // Add search conditions if search query exists
    if (search) {
      filterQuery.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'user.fullname': { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter if not 'all'
    if (filter !== 'all') {
      filterQuery.orderStatus = filter;
    }

    // Build sort object
    let sortObj = {};
    sortObj[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const total = await Order.countDocuments(filterQuery);

    // Fetch orders with filters, sorting and pagination
    const orders = await Order.find(filterQuery)
      .populate('user', 'fullname email')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: "Failed to fetch orders",
      error: error.message 
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

// Update getReturnRequests to handle search and pagination
export const getReturnRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    // Build filter query
    let filterQuery = {
      'items': {
        $elemMatch: {
          'returnRequested': true
        }
      }
    };

    // Add search conditions if search exists
    if (search) {
      filterQuery.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'user.fullname': { $regex: search, $options: 'i' } },
        { 'items.product.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter if not 'all'
    if (status !== 'all') {
      filterQuery['items.returnStatus'] = status;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Order.countDocuments(filterQuery);

    // Fetch returns with filters and pagination
    const returns = await Order.find(filterQuery)
      .populate('user', 'fullname email')
      .populate({
        path: 'items.product',
        select: 'name images'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Send response with pagination metadata
    res.json({
      returns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReturns: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch returns",
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