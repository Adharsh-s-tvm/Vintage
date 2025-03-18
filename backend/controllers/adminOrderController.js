import Order from '../models/product/orderModel.js';

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Don't allow updating cancelled orders
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ 
        message: 'Cannot update cancelled orders' 
      });
    }

    // Update order status
    order.orderStatus = status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Add other admin controller methods as needed...
