import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Person } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Layout } from '../layout/Layout';

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [itemsPerPage] = useState(5); // Set a fixed number of items per page

  useEffect(() => {
    fetchWalletDetails();
  }, [currentPage]); // Changed to depend on currentPage instead of searchParams

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/user/profile/wallet`, {
        params: {
          page: currentPage,
          limit: itemsPerPage
        },
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        withCredentials: true
      });
      
      if (response.data) {
        setWallet(response.data.wallet);
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.totalPages);
        setTotalTransactions(response.data.pagination.totalTransactions);
        
        // Update URL with current page
        const params = new URLSearchParams(searchParams);
        params.set('page', currentPage.toString());
        setSearchParams(params);
      } else {
        toast.error('No wallet data received');
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
      toast.error('Failed to fetch wallet details');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4">
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </Button>
          <Button
            variant="contained"
            endIcon={<ShoppingBag />}
            onClick={() => navigate('/products')}
            className="bg-green-500"
          >
            Continue Shopping
          </Button>
        </Box>

        {/* Wallet Balance Card */}
        <Paper className="bg-gray-900 text-white p-4 mb-4 rounded-lg">
          <Typography variant="h6" className="mb-1">
            Wallet Balance
          </Typography>
          <Typography variant="h4" className="text-green-500">
            ₹{wallet?.balance || 0}
          </Typography>
        </Paper>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <Typography variant="h6" className="text-blue-400">
            Transaction History ({totalTransactions} transactions)
          </Typography>

          <Paper className="overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={transaction.type === 'credit' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">₹{transaction.amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(currentPage - page) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "contained" : "outlined"}
                          size="small"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Wallet;