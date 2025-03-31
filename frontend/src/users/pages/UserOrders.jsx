import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { ArrowRight, Download, Package, Truck, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../lib/apiCall';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";
import { Input } from '../../ui/Input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/Pagination';
import { debounce } from 'lodash';
import { useSearchParams } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage] = useState(parseInt(searchParams.get('limit')) || 5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Add returnReasons constant here
  const returnReasons = [
    "Defective",
    "Not as described",
    "Wrong size/fit",
    "Changed my mind",
    "Other"
  ];

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

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      const params = new URLSearchParams(searchParams);
      params.set('search', value);
      params.set('page', '1');
      setSearchParams(params);
    }, 500),
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams(searchParams);
      if (!params.has('page')) params.set('page', currentPage.toString());
      if (!params.has('limit')) params.set('limit', itemsPerPage.toString());
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const response = await axios.get(`${api}/user/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
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
        { 
          withCredentials: true,
          headers: { 
            'Content-Type': 'application/json'
          } 
        }
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

        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search orders by ID, status, amount, or date..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 w-full md:w-96"
            />
          </div>
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
                className="bg-white rounded-lg shadow-sm overflow-hidden p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
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
                      <span className="text-sm capitalize">{order.orderStatus}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {['pending', 'Processing'].includes(order.orderStatus) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelClick(order.orderId)}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.orderStatus === 'Delivered' && (
                      <>
                        {order.items.some(item => item.returnRequested) ? (
                          <div className={`text-sm px-2 py-1 rounded ${
                            order.items.find(item => item.returnRequested)?.returnStatus === 'Return Approved' 
                              ? 'bg-green-100 text-green-800'
                              : order.items.find(item => item.returnRequested)?.returnStatus === 'Return Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.items.find(item => item.returnRequested)?.returnStatus}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnClick(order.orderId)}
                          >
                            Return
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/order-details/${order.orderId}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
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
                <Select
                  value={returnForm.reason}
                  onValueChange={(value) => setReturnForm(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {returnReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  );
}
