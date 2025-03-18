import Order from "../../models/product/orderModel.js";

export const getAllOrders = async (req, res) => {
    console.log("List vgiavgyc");
    
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 }) // Most recent orders first
      .select('_id createdAt user totalAmount orderStatus');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
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