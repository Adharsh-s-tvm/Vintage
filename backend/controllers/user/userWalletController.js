import Wallet from '../../models/walletModel.js';
import Order from '../../models/product/orderModel.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import mongoose from 'mongoose';

// Get wallet details
export const getWalletDetails = asyncHandler(async (req, res) => {
  try {
    // Validate and sanitize limit parameter
    let limit = parseInt(req.query.limit) || 10;
    // Ensure limit is within acceptable range
    limit = Math.min(Math.max(limit, 5), 50); // Min 5, Max 50
    
    const page = parseInt(req.query.page) || 1;

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        transactions: []
      });
    }

    // Get total count of transactions
    const totalTransactions = wallet.transactions.length;

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Get paginated transactions
    const paginatedTransactions = wallet.transactions
      .sort((a, b) => b.date - a.date) // Sort by date descending
      .slice(startIndex, endIndex);

    res.json({
      wallet: {
        _id: wallet._id,
        userId: wallet.userId,
        balance: wallet.balance
      },
      transactions: paginatedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        hasNextPage: endIndex < totalTransactions,
        hasPrevPage: page > 1,
        limit,
        itemsPerPage: limit // Include current items per page in response
      }
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch wallet details",
      error: error.message 
    });
  }
});

// Process refund for canceled order
export const processCancelRefund = async (orderId, userId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
    }

    // Add refund transaction
    const refundAmount = order.totalAmount;
    wallet.balance += refundAmount;
    wallet.transactions.push({
      type: 'credit',
      amount: refundAmount,
      description: `Refund for cancelled order #${order._id}`,
      date: new Date()
    });

    await wallet.save();
    return true;
  } catch (error) {
    console.error('Refund processing error:', error);
    return false;
  }
};

// Process refund for returned order
export const processReturnRefund = async (orderId, userId, amount, description, session) => {
  try {
    let wallet = await Wallet.findOne({ userId }).session(session);
    
    if (!wallet) {
      wallet = await Wallet.create([{
        userId,
        balance: 0,
        transactions: []
      }], { session });
      wallet = wallet[0];
    }

    wallet.balance += amount;
    wallet.transactions.push({
      userId,
      type: 'credit',
      amount,
      description: description || `Refund for order #${orderId}`,
      date: new Date()
    });

    await wallet.save({ session });
    return true;
  } catch (error) {
    console.error('Return refund processing error:', error);
    return false;
  }
}; 