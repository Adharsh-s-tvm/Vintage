import Wallet from '../../models/walletModel.js';
import Order from '../../models/product/orderModel.js';

// Get wallet details
export const getWalletDetails = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id })
      .populate('userId', 'username email');

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        transactions: []
      });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
export const processReturnRefund = async (orderId, userId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
    }

    const refundAmount = order.totalAmount;
    wallet.balance += refundAmount;
    wallet.transactions.push({
      type: 'credit',
      amount: refundAmount,
      description: `Refund for returned order #${order._id}`,
      date: new Date()
    });

    await wallet.save();
    return true;
  } catch (error) {
    console.error('Return refund processing error:', error);
    return false;
  }
}; 