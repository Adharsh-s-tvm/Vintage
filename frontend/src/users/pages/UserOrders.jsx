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
import { ChevronDown } from 'lucide-react';

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Your Orders</h1>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/products">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                >
                  <div className="grid grid-cols-4 gap-4 flex-1">
                    <div>
                      <div className="text-sm font-medium">Order #{order.orderId}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm">
                      {order.items?.length} items
                    </div>
                    <div className="text-sm font-medium">
                      ₹{order.totalAmount.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.items?.[0]?.status)}
                      <span className="text-sm">{order.items?.[0]?.status}</span>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform ${
                      selectedOrder?._id === order._id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>

                {selectedOrder?._id === order._id && (
                  <div className="border-t border-gray-100 p-4">
                    <Tabs defaultValue="items" className="w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value="items">Items</TabsTrigger>
                        <TabsTrigger value="shipping">Shipping</TabsTrigger>
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                      </TabsList>
                      
                      
                      
                      <TabsContent value="items">
                        <div className="space-y-4 mt-4">
                          {order.items?.map((item) => (
                            <div key={item._id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                              <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.sizeVariant?.mainImage ? (
                                  <img
                                    src={item.sizeVariant.mainImage}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : item.product.images?.[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.product.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {item.product.brand?.name} • {item.product.category?.name}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Size: {item.sizeVariant?.size} • Color: {item.sizeVariant?.color}
                                </div>
                                <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                                <div className="text-sm font-medium text-gray-900 mt-2">
                                  ₹{item.price.toFixed(2)} × {item.quantity} = ₹{item.finalPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                Status: <span className="text-blue-600">{item.status}</span>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between pt-4 border-t border-gray-200">
                            <span className="font-medium">Total Amount:</span>
                            <span className="font-bold">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="shipping">
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium mb-3">Shipping Address</h3>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium">{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>
                              {order.shippingAddress?.city}, {order.shippingAddress?.state}
                            </p>
                            <p>PIN: {order.shippingAddress?.pinCode}</p>
                            <p>Phone: {order.shippingAddress?.phone}</p>
                          </div>
                          {order.shippingMethod && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-medium mb-2">Shipping Method</h4>
                              <p className="text-sm">{order.shippingMethod}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="payment">
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium mb-3">Payment Details</h3>
                          <div className="grid gap-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-600">Method</p>
                                <p className="font-medium capitalize">{order.payment?.method}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Status</p>
                                <p className="font-medium capitalize">{order.payment?.status}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600">Transaction ID</p>
                              <p className="font-medium">{order.payment?.transactionId}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payment Date</p>
                              <p className="font-medium">
                                {new Date(order.payment?.paymentDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span>Amount Paid</span>
                                <span className="font-bold">₹{order.payment?.amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-3 mt-4">
                      {['pending', 'Processing'].includes(order.items[0]?.status) && 
                        !order.items[0]?.status.includes('Cancelled') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(order.orderId)}
                          >
                            Cancel Order
                          </Button>
                        )}

                      {order.items[0]?.status === 'Delivered' && (
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
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-lg mx-auto">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              When you place an order, it will appear here for you to track and manage.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
