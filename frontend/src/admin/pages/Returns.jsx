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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/Dialog";

function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReturns = async () => {
    try {
      const response = await axios.get(`${api}/admin/returns`, {
        params: {
          page: currentPage,
          search: searchQuery,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      
      setReturns(response.data.returns || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch return requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [currentPage, searchQuery]);

  const handleReturnAction = async (orderId, itemId, action) => {
    try {
      await axios.patch(
        `${api}/admin/orders/${orderId}/return`,
        { approved: action === 'accept' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      toast.success(`Return request ${action}ed successfully`);
      fetchReturns();
    } catch (error) {
      toast.error(`Failed to ${action} return request`);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Return Requests</CardTitle>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
              fetchReturns();
            }} className="flex gap-2">
              <Input
                placeholder="Search by Order ID or Customer"
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
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Return Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.length > 0 ? (
                  returns.map((order) => (
                    order.items.map((item) => (
                      item.returnRequest && (
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
                          <TableCell>{item.returnRequest?.reason}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReturnAction(order._id, item._id, 'accept')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReturnAction(order._id, item._id, 'reject')}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ))
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No return requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Returns;