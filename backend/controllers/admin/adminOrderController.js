import Order from "../../models/product/orderModel.js";

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
      .select('_id createdAt user totalAmount orderStatus')
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