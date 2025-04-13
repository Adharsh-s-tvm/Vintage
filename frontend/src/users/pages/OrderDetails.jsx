import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { Package, Truck, Check, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { downloadInvoiceApi, fetchOrderDetailsApi, userReturnOrderItemApi } from '../../services/api/userApis/userOrderApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/Dialog';
import { Label } from '../../ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/Select';
import { Textarea } from '../../ui/Textarea';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnDialog, setReturnDialog] = useState({
    open: false,
    orderId: null,
    itemId: null
  });
  const [returnForm, setReturnForm] = useState({
    reason: '',
    additionalDetails: ''
  });
  const returnReasons = [
    "Defective",
    "Not as described",
    "Wrong size/fit",
    "Changed my mind",
    "Other"
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetchOrderDetailsApi(orderId)

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
        return 'text-orange-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await downloadInvoiceApi(orderId)

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);

      document.body.appendChild(link);
      link.click();

      // Show toast after a brief delay to ensure download has started
      setTimeout(() => {
        toast('Invoice downloaded successfully', {
          description: 'Your invoice has been downloaded to your device.',
        });
      }, 2000); // 2 seconds delay

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 2500);

    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast('Failed to download invoice', {
        description: 'There was an error downloading your invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReturnSubmit = async () => {
    if (!returnForm.reason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    try {
      const response = await userReturnOrderItemApi(
        returnDialog.orderId,
        returnDialog.itemId,
        returnForm
      );

      if (response.data.success) {
        toast.success('Return request submitted successfully');
        setReturnDialog({ open: false, orderId: null, itemId: null });
        setReturnForm({ reason: '', additionalDetails: '' });
        fetchOrderDetails(); // Refresh order details
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <Button asChild className="mt-4">
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-fadeIn">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between mb-6 animate-slideDown">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:scale-105 transition-transform"
              asChild
            >
              <Link to="/orders">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Link>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
              onClick={handleDownloadInvoice}
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl animate-slideUp">
            {/* Order Header */}
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order?.orderId}</h1>
                  <p className="text-gray-600">
                    Placed on {new Date(order?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                  {getStatusIcon(order?.orderStatus)}
                  <span className={`text-lg font-medium capitalize ${getStatusColor(order?.orderStatus)}`}>
                    {order?.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 border-b space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <div className="text-lg font-semibold text-green-600">
                  Total: ₹{order?.totalAmount?.toFixed(2)}
                </div>
              </div>
              <div className="grid gap-4">
                {order?.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col md:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 transform hover:scale-105 transition-transform">
                      <img
                        src={item.sizeVariant?.mainImage}
                        alt={item.product?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="font-medium text-lg">{item.product?.name}</h3>
                          <div className="text-gray-600">
                            Size: {item.sizeVariant?.size} •
                            Color: {item.sizeVariant?.color}
                          </div>
                          <div className="text-gray-600">Quantity: {item.quantity}</div>
                          {item.returnRequested && (
                            <div className={`text-sm mt-2 ${item.returnStatus === 'Return Approved'
                              ? 'text-green-600'
                              : item.returnStatus === 'Return Rejected'
                                ? 'text-red-600'
                                : 'text-yellow-600'}`}
                            >
                              Return Status: {item.returnStatus}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <div className="font-medium text-gray-900">
                            ₹{(item.price || 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Subtotal: ₹{((item.price || 0) * item.quantity).toFixed(2)}
                          </div>
                          {order.orderStatus === 'Delivered' && !item.returnRequested && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              onClick={() => setReturnDialog({
                                open: true,
                                orderId: order.orderId,
                                itemId: item._id
                              })}
                            >
                              Return Item
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="p-6 border-b hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                <p className="font-medium text-gray-900">{order?.shipping?.address?.fullName}</p>
                <p className="text-gray-600">{order?.shipping?.address?.street}</p>
                <p className="text-gray-600">
                  {order?.shipping?.address?.city}, {order?.shipping?.address?.state} {order?.shipping?.address?.postalCode}
                </p>
                <p className="text-gray-600">Phone: {order?.shipping?.address?.phone}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium capitalize text-gray-900">{order?.payment?.method}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Payment Status</p>
                    <p className="font-medium capitalize text-gray-900">{order?.payment?.status}</p>
                  </div>
                  {order?.payment?.transactionId && (
                    <div className="space-y-1">
                      <p className="text-gray-600">Transaction ID</p>
                      <p className="font-medium text-gray-900">{order.payment.transactionId}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium text-green-600">₹{order?.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Details */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-semibold mb-4">Discount Details</h2>
              <div className="space-y-3">
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Total Savings</span>
                    <span>-₹{order.totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                {order.couponCode && (
                  <div className="text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm">
                    <span>Applied Coupon: {order.couponCode}</span>
                    {order.discountAmount > 0 && (
                      <span className="ml-2 text-green-600">(Saved ₹{order.discountAmount.toFixed(2)})</span>
                    )}
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t border-green-100">
                  <span>Final Amount</span>
                  <span className="text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Return Details Dialog */}
          <Dialog
            open={returnDialog.open}
            onOpenChange={(open) => {
              if (!open) {
                setReturnDialog({ open: false, orderId: null, itemId: null });
                setReturnForm({ reason: '', additionalDetails: '' });
              }
            }}
          >
            <DialogContent className="bg-white rounded-lg shadow-xl sm:max-w-[425px] p-6 animate-scaleUp">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Return Item
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="reason" className="text-gray-700">Reason for Return *</Label>
                  <Select
                    value={returnForm.reason}
                    onValueChange={(value) => setReturnForm(prev => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnReasons.map((reason) => (
                        <SelectItem
                          key={reason}
                          value={reason}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="additionalDetails" className="text-gray-700">Additional Details</Label>
                  <Textarea
                    id="additionalDetails"
                    value={returnForm.additionalDetails}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, additionalDetails: e.target.value }))}
                    placeholder="Any additional information about the return..."
                    className="mt-2 resize-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReturnDialog({ open: false, orderId: null, itemId: null });
                    setReturnForm({ reason: '', additionalDetails: '' });
                  }}
                  className="hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReturnSubmit}
                  disabled={!returnForm.reason.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Submit Return Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
