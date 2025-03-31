import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { api } from '../../lib/apiCall';
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
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [itemsPerPage] = useState(parseInt(searchParams.get('limit')) || 5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

  // Add debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      const params = new URLSearchParams(searchParams);
      params.set('search', value);
      params.set('page', '1');
      setSearchParams(params);
    }, 500),
    [searchParams, setSearchParams]
  );

  const fetchReturns = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams(searchParams);
      
      // Ensure required parameters are set
      if (!params.has('page')) params.set('page', currentPage.toString());
      if (!params.has('limit')) params.set('limit', itemsPerPage.toString());
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const response = await axios.get(`${api}/admin/orders/returns?${params}`, {
        withCredentials: true
      });

      setReturns(response.data.returns);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to fetch return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [searchParams]); // Only depend on searchParams

  const handleSearch = (e) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    setCurrentPage(newPage);
  };

  const handleFilterChange = (status) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', status);
    params.set('page', '1');
    setSearchParams(params);
    setFilterStatus(status);
  };

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
              <div className="mb-4">
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="all">All Status</option>
                  <option value="Return Pending">Pending</option>
                  <option value="Return Approved">Approved</option>
                  <option value="Return Rejected">Rejected</option>
                </select>
              </div>

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

              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index + 1}>
                        <PaginationLink
                          onClick={() => handlePageChange(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}