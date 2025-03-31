import React, { useState, useEffect } from 'react';
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSearchParams } from 'react-router-dom';

// Add these imports at the top
import { Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/Dialog";
import { fetchOrdersApi, updateOrderStatusApi } from '../../services/api/adminApis/orderApi';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(4);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'all');
  const [sortField, setSortField] = useState(searchParams.get('sort') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', itemsPerPage.toString());
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (filterStatus !== 'all') {
        params.set('filter', filterStatus);
      }
      params.set('sort', sortField);
      params.set('order', sortOrder);

      // Update URL parameters
      setSearchParams(params);

      const response = await fetchOrdersApi(params);

      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]); // Fetch when URL params change

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('search', searchQuery);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('filter', newStatus);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSort = (field) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    const params = new URLSearchParams(searchParams);
    params.set('sort', field);
    params.set('order', newOrder);
    setSearchParams(params);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      
      fetchOrders(); // Refresh orders after status change
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

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Orders Management</CardTitle>
            </div>

            {/* Search and Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    type="submit"
                    variant="ghost" 
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <Select value={filterStatus} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('orderId')}
                    >
                      Order ID
                      {sortField === 'orderId' && (
                        sortOrder === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                      )}
                    </TableHead>
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
                          <TableCell>₹{order.totalAmount?.toFixed(2)}</TableCell>
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
                                  <div>
                                    <p className="text-sm text-gray-600">Shipping Address:</p>
                                    <p className="font-medium">
                                      {order.shipping?.address?.fullName}<br />
                                      {order.shipping?.address?.street}<br />
                                      {order.shipping?.address?.city}, {order.shipping?.address?.state} {order.shipping?.address?.postalCode}<br />
                                      {order.shipping?.address?.country}<br />
                                      Phone: {order.shipping?.address?.phone}
                                    </p>
                                  </div>
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
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => {
                          const newPage = Math.max(currentPage - 1, 1);
                          setCurrentPage(newPage);
                          const params = new URLSearchParams(searchParams);
                          params.set('page', newPage.toString());
                          setSearchParams(params);
                        }}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index + 1}>
                        <PaginationLink
                          onClick={() => {
                            setCurrentPage(index + 1);
                            const params = new URLSearchParams(searchParams);
                            params.set('page', (index + 1).toString());
                            setSearchParams(params);
                          }}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          const newPage = Math.min(currentPage + 1, totalPages);
                          setCurrentPage(newPage);
                          const params = new URLSearchParams(searchParams);
                          params.set('page', newPage.toString());
                          setSearchParams(params);
                        }}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add this Dialog component before the CardContent */}
    
    </div>
  );
}

export default Orders;