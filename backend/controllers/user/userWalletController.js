import Wallet from '../../models/walletModel.js';
import Order from '../../models/product/orderModel.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import mongoose from 'mongoose';

// Get wallet details
export const getWalletDetails = asyncHandler(async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id })
      .populate('userId', 'username email')
      .sort({ 'transactions.date': -1 }); // Sort transactions by date descending

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        transactions: []
      });
    }

    res.json(wallet);
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ message: error.message });
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
export const processReturnRefund = asyncHandler(async (orderId, userId, amount, description) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
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
        type: 'credit',
        amount,
        description: description || `Refund for order #${orderId}`,
        date: new Date()
      });

      await wallet.save({ session });
      return true;
    });
  } catch (error) {
    console.error('Return refund processing error:', error);
    return false;
  } finally {
    session.endSession();
  }
}); 