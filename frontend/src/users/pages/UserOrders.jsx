import React, { useState, useEffect } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { ArrowRight, Download, Package, Truck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/Dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/Tabs';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnDialog, setReturnDialog] = useState({ open: false, order: null });
  const [returnForm, setReturnForm] = useState({
    reason: '',
    additionalDetails: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${api}/user/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`, // Fixed token name
          'Content-Type': 'application/json'
        }
      });

      setOrders(response.data.orders || []); // Simplified response handling


    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await axios.put(
        `${api}/user/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReturn = async (orderId) => {
    try {
      await axios.post(
        `${api}/user/orders/${orderId}/return`,
        returnForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      toast.success('Return request submitted successfully');
      setReturnDialog({ open: false, order: null });
      setReturnForm({ reason: '', additionalDetails: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'Delivered':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="border-b border-gray-100 p-4 md:p-6">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <div className="text-sm text-gray-500">Order #{order.orderId}</div>
                        <div className="text-sm">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.items?.length > 0 && getStatusIcon(order.items[0].status)}
                        <span className="font-medium">{order.items?.[0]?.status || 'Unknown Status'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    <div className="flex flex-wrap gap-4">
                      {order.items?.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item._id} className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                              {/* <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" /> */}
                            </div>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-gray-500">₹{item.price.toFixed(2)} × {item.quantity}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No items in this order</p>
                      )}

                    </div>

                    <div className="mt-4 flex flex-wrap justify-between items-center">
                      <div className="font-medium text-lg">
                        Total: ₹{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="flex space-x-3 mt-4 sm:mt-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Order Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                              <DialogTitle>Order #{selectedOrder?.orderId}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-6">
                              <Tabs defaultValue="items">
                                <TabsList className="w-full">
                                  <TabsTrigger value="items" className="flex-1">
                                    Items
                                  </TabsTrigger>
                                  <TabsTrigger value="shipping" className="flex-1">
                                    Shipping
                                  </TabsTrigger>
                                  <TabsTrigger value="payment" className="flex-1">
                                    Payment
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="items">
                                  <div className="space-y-4 mt-4">
                                    {order.items?.length > 0 &&
                                      order.items.map((item) => (
                                        <div key={item._id} className="flex items-center space-x-4">
                                          <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                                            {/* <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" /> */}
                                          </div>
                                          <div>
                                            <div className="font-medium">{item.product.name}</div>
                                            <div className="text-sm text-gray-500">
                                              ₹{item.price.toFixed(2)} × {item.quantity}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    }

                                    <div className="flex justify-between pt-2">
                                      <span className="font-bold">Total:</span>
                                      <span className="font-bold">₹{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="shipping">
                                  <div className="mt-4">
                                    <h3 className="font-medium mb-2">Shipping Address</h3>
                                    <div className="text-sm space-y-1">
                                      <p>{order.shippingAddress?.fullName || "N/A"}</p>
                                      <p>{order.shippingAddress?.street || "N/A"}</p>
                                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                      <p>{order.shippingAddress?.pinCode || "N/A"}</p>
                                      <p>{order.shippingAddress?.phone || "N/A"}</p>

                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="payment">
                                  <div className="mt-4">
                                    <h3 className="font-medium mb-2">Payment Details</h3>
                                    <div className="text-sm space-y-2">
                                      <p>Method: {order.payment?.method || "N/A"}</p>
                                      <p>Status: {order.payment?.status || "N/A"}</p>
                                      <p>Transaction ID: {order.payment?.transactionId || "N/A"}</p>

                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {['pending', 'Processing'].includes(order.items[0].status) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(order.orderId)}
                          >
                            Cancel Order
                          </Button>
                        )}

                        {order.items[0].status === 'Delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReturnDialog({ open: true, order })}
                          >
                            Return Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>)
          : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-medium mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                When you place an order, it will appear here for you to track.
              </p>
              <Button asChild>
                <Link to="/products">Start Shopping</Link>
              </Button>
            </div>
          )}
      </div>
    </Layout>
  );
}
