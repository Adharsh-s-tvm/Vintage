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
  DialogFooter,
} from '../../ui/Dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/Tabs';
import { ChevronDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/AlertDialog";
import { Label } from "../../ui/Label";
import { Textarea } from "../../ui/Textarea";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnConfirmDialog, setReturnConfirmDialog] = useState({ 
    open: false, 
    orderId: null 
  });
  const [returnDialog, setReturnDialog] = useState({ 
    open: false, 
    orderId: null 
  });
  const [returnForm, setReturnForm] = useState({
    reason: '',
    additionalDetails: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    orderId: null 
  });
  const [cancelDialog, setCancelDialog] = useState({ 
    open: false, 
    orderId: null 
  });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${api}/user/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Ensure orders are properly sorted by date
      const sortedOrders = (response.data.orders || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (orderId) => {
    setConfirmDialog({ open: true, orderId });
  };

  const handleConfirmCancellation = () => {
    setCancelDialog({ open: true, orderId: confirmDialog.orderId });
    setConfirmDialog({ open: false, orderId: null });
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await axios.put(
        `${api}/user/orders/${cancelDialog.orderId}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      toast.success('Order cancelled successfully');
      setCancelDialog({ open: false, orderId: null });
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReturnClick = (orderId) => {
    setReturnConfirmDialog({ open: true, orderId });
  };

  const handleReturnConfirmation = () => {
    setReturnDialog({ open: true, orderId: returnConfirmDialog.orderId });
    setReturnConfirmDialog({ open: false, orderId: null });
  };

  const handleReturnSubmit = async () => {
    if (!returnForm.reason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    try {
      await axios.post(
        `${api}/user/orders/${returnDialog.orderId}/return`,
        returnForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      toast.success('Return request submitted successfully');
      setReturnDialog({ open: false, orderId: null });
      setReturnForm({ reason: '', additionalDetails: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered':
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
                      {getStatusIcon(order.orderStatus)}
                      <span className="text-sm">{order.orderStatus}</span>
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
                                {item.sizeVariant?.mainImage && (
                                  <img
                                    src={item.sizeVariant.mainImage}
                                    alt={item.product?.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.product?.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Size: {item.sizeVariant?.size} • Quantity: {item.quantity}
                                </div>
                                <div className="text-sm font-medium text-gray-900 mt-2">
                                  ₹{item.price.toFixed(2)} × {item.quantity} = ₹{item.finalPrice.toFixed(2)}
                                </div>
                              </div>
                              {['pending', 'Processing'].includes(item.status) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelClick(order.orderId)}
                                  className="ml-4"
                                >
                                  Cancel
                                </Button>
                              )}
                              {order.orderStatus === 'Delivered' && !order.returnRequested && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReturnClick(order.orderId)}
                                  className="ml-4"
                                >
                                  Return
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="shipping">
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium mb-3">Shipping Address</h3>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium">{order.shipping?.address?.fullName}</p>
                            <p>{order.shipping?.address?.street}</p>
                            <p>
                              {order.shipping?.address?.city}, {order.shipping?.address?.state}
                            </p>
                            <p>{order.shipping?.address?.country}</p>
                            <p>PIN: {order.shipping?.address?.postalCode}</p>
                            <p>Phone: {order.shipping?.address?.phone}</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="payment">
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium mb-3">Payment Details</h3>
                          <div className="space-y-2 text-sm">
                            <p>Method: {order.payment?.method}</p>
                            <p>Status: {order.payment?.status}</p>
                            <p>Transaction ID: {order.payment?.transactionId}</p>
                            <p>Amount: ₹{order.payment?.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog 
          open={confirmDialog.open}
          onOpenChange={(open) => {
            if (!open) setConfirmDialog({ open: false, orderId: null });
          }}
        >
          <AlertDialogContent className="bg-white rounded-lg shadow-lg sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                Cancel Order
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-end gap-3 mt-6">
              <AlertDialogCancel
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setConfirmDialog({ open: false, orderId: null })}
              >
                No, keep order
              </AlertDialogCancel>
              <AlertDialogAction
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={handleConfirmCancellation}
              >
                Yes, cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reason Input Dialog */}
        <Dialog 
          open={cancelDialog.open} 
          onOpenChange={(open) => {
            if (!open) {
              setCancelDialog({ open: false, orderId: null });
              setCancelReason('');
            }
          }}
        >
          <DialogContent className="bg-white rounded-lg shadow-lg sm:max-w-[425px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Cancellation Reason
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-2">
                Please tell us why you're cancelling this order.
              </p>
            </DialogHeader>
            <div className="mt-4">
              <Label 
                htmlFor="reason" 
                className="text-sm font-medium text-gray-700"
              >
                Reason for Cancellation
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide details about why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2 min-h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DialogFooter className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelDialog({ open: false, orderId: null });
                  setCancelReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelConfirm}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit & Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Return Confirmation Dialog */}
        <AlertDialog 
          open={returnConfirmDialog.open}
          onOpenChange={(open) => {
            if (!open) setReturnConfirmDialog({ open: false, orderId: null });
          }}
        >
          <AlertDialogContent className="bg-white rounded-lg shadow-lg sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                Return Order
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Are you sure you want to return this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-end gap-3 mt-6">
              <AlertDialogCancel
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                No, keep order
              </AlertDialogCancel>
              <AlertDialogAction
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={handleReturnConfirmation}
              >
                Yes, return order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Return Details Dialog */}
        <Dialog 
          open={returnDialog.open} 
          onOpenChange={(open) => {
            if (!open) {
              setReturnDialog({ open: false, orderId: null });
              setReturnForm({ reason: '', additionalDetails: '' });
            }
          }}
        >
          <DialogContent className="bg-white rounded-lg shadow-lg sm:max-w-[425px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Return Details
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Return *</Label>
                <Textarea
                  id="reason"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Why are you returning this order?"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="additionalDetails">Additional Details</Label>
                <Textarea
                  id="additionalDetails"
                  value={returnForm.additionalDetails}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, additionalDetails: e.target.value }))}
                  placeholder="Any additional information about the return..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setReturnDialog({ open: false, orderId: null });
                  setReturnForm({ reason: '', additionalDetails: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReturnSubmit}
                disabled={!returnForm.reason.trim()}
              >
                Submit Return Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
