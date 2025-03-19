import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { ChevronDown, ChevronUp } from "lucide-react"; // Add this import

// Add these imports at the top
import { Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/Dialog";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${api}/admin/orders`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      
      // Ensure orders are properly populated
      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${api}/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
        }
      );
      
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, orderStatus: newStatus }
          : order
      ));
      
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Add these state variables
  const [pendingReturns, setPendingReturns] = useState([]);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Add this function to fetch pending returns
  const fetchPendingReturns = async () => {
    try {
      const response = await axios.get(`${api}/admin/returns/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      setPendingReturns(response.data.returns || []);
    } catch (error) {
      console.error('Error fetching pending returns:', error);
    }
  };

  // Add this to your existing useEffect
  useEffect(() => {
    fetchOrders();
    fetchPendingReturns(); // Add this line
  }, [currentPage, searchQuery]);

  // Add these handler functions
  const handleReturnAction = async (returnId, action) => {
    try {
      await axios.patch(
        `${api}/admin/returns/${returnId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      toast.success(`Return request ${action}ed successfully`);
      fetchPendingReturns();
      setReturnDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to ${action} return request`);
    }
  };

  // Add this JSX right after the CardHeader closing tag
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle>Orders Management</CardTitle>
              {pendingReturns.length > 0 && (
                <div className="relative cursor-pointer" onClick={() => setReturnDialogOpen(true)}>
                  <Bell className="h-6 w-6 text-gray-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingReturns.length}
                  </span>
                </div>
              )}
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by Order ID or Customer Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardHeader>

        {/* Add this Dialog component before the CardContent */}
        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pending Return Requests</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 my-4">
              {pendingReturns.map((returnRequest) => (
                <div key={returnRequest._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Order #{returnRequest.orderId}</p>
                      <p className="text-sm text-gray-600">
                        Reason: {returnRequest.reason}
                      </p>
                      <p className="text-sm text-gray-600">
                        Details: {returnRequest.additionalDetails}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleReturnAction(returnRequest._id, 'accept')}
                    >
                      Accept Return
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReturnAction(returnRequest._id, 'reject')}
                    >
                      Reject Return
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <TableRow className="cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.user?.fullname || 'N/A'}</TableCell>
                      <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={order.orderStatus}
                            onValueChange={(value) => handleStatusChange(order._id, value)}
                            disabled={order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered'}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue>{order.orderStatus}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                          {expandedOrders.has(order._id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedOrders.has(order._id) && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50">
                          <div className="p-4">
                            <h4 className="font-semibold mb-2">Order Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Customer Email:</p>
                                <p className="font-medium">{order.user?.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Order Date:</p>
                                <p className="font-medium">
                                  {new Date(order.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {/* Add more order details as needed */}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default Orders;