import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/Card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/Pagination";

function Returns() {
  const [returns, setReturns] = useState([]);
  const [allReturns, setAllReturns] = useState([]); // Store all returns for frontend filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/admin/orders/returns`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      
      const returnOrders = response.data.returns.filter(order => 
        order.items.some(item => item.returnRequested)
      );
      
      setAllReturns(returnOrders);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch return requests');
      setLoading(false);
    }
  };

  // Filter returns based on search query
  const getFilteredReturns = () => {
    if (!allReturns.length) return [];
    
    if (!searchQuery.trim()) return allReturns;
    
    const query = searchQuery.toLowerCase();
    return allReturns.filter(order => 
      order.orderId?.toLowerCase().includes(query) ||
      order.user?.fullname?.toLowerCase().includes(query) ||
      order.items.some(item => 
        item.product?.name?.toLowerCase().includes(query) ||
        item.returnReason?.toLowerCase().includes(query)
      )
    );
  };

  // Get paginated returns
  const getPaginatedReturns = () => {
    const filtered = getFilteredReturns();
    
    // Count total items after flattening the data structure
    const flattenedItems = filtered.flatMap(order => 
      order.items
        .filter(item => item.returnRequested)
        .map(item => ({ order, item }))
    );
    
    const totalItems = flattenedItems.length;
    const totalFilteredPages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(totalFilteredPages || 1);
    
    // Adjust current page if it exceeds the new total pages
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
    }
    
    // Paginate the flattened items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = flattenedItems.slice(startIndex, endIndex);
    
    // Group back by order for rendering
    const orderMap = new Map();
    
    paginatedItems.forEach(({ order, item }) => {
      if (!orderMap.has(order._id)) {
        orderMap.set(order._id, { ...order, items: [] });
      }
      orderMap.get(order._id).items.push(item);
    });
    
    return Array.from(orderMap.values());
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  // Update returns when search or pagination changes
  useEffect(() => {
    const paginatedData = getPaginatedReturns();
    setReturns(paginatedData);
  }, [searchQuery, currentPage, allReturns]);

  const handleReturnAction = async (orderId, itemId, action) => {
    try {
      const response = await axios.put(
        `${api}/admin/orders/${orderId}/items/${itemId}/return`,
        { action },
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      
      if (response.data) {
        toast.success(`Return request ${action}ed successfully`);
        fetchReturns(); // Refresh the returns list
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} return request`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Return Requests</CardTitle>
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-none sm:max-w-md">
              <Input
                placeholder="Search by Order ID, Customer or Product"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="whitespace-nowrap">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearSearch}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Return Reason</TableHead>
                    <TableHead>Additional Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.length > 0 ? (
                    returns.flatMap((order) => 
                      order.items
                        .filter(item => item.returnRequested)
                        .map((item) => (
                          <TableRow key={`${order._id}-${item._id}`}>
                            <TableCell>{order.orderId}</TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{order.user?.fullname}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {item.product?.images?.[0] && (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <span>{item.product?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.returnReason}</TableCell>
                            <TableCell>{item.additionalDetails}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.returnStatus === 'Return Pending' ? 'bg-yellow-100 text-yellow-800' :
                                item.returnStatus === 'Return Approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.returnStatus}
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.returnStatus === 'Return Pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 text-green-600 hover:bg-green-100"
                                    onClick={() => handleReturnAction(order._id, item._id, 'accept')}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-50 text-red-600 hover:bg-red-100"
                                    onClick={() => handleReturnAction(order._id, item._id, 'reject')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        No return requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex flex-wrap justify-center gap-2">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Returns;