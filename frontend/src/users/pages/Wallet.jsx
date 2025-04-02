import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Person } from '@mui/icons-material';
import { toast } from 'sonner';
import { Layout } from '../layout/Layout';
import { fetchWalletDetailsApi } from '../../services/api/userApis/profileApi';

function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletDetails(currentPage);
  }, [currentPage]);

  const fetchWalletDetails = async (page) => {
    try {
      setLoading(true);
      const response = await fetchWalletDetailsApi(page);
      
      if (response.data?.success) {
        setWallet(response.data.wallet);
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.totalPages);
        setTotalTransactions(response.data.pagination.totalTransactions);
      } else {
        toast.error('Failed to fetch wallet details');
      }
    } catch (error) {
      console.error('Error:', error);
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
        {/* Navigation */}
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
          >
            Continue Shopping
          </Button>
        </Box>

        {/* Wallet Balance */}
        <Paper className="bg-gray-900 text-white p-4 mb-4 rounded-lg">
          <Typography variant="h6">Wallet Balance</Typography>
          <Typography variant="h4" className="text-green-500">
            ₹{wallet.balance}
          </Typography>
        </Paper>

        {/* Transaction History Header */}
        <Typography variant="h6" className="mb-3">
          Transaction History ({totalTransactions} transactions)
        </Typography>

        {/* Transactions Table */}
        <TableContainer component={Paper} className="mb-4">
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
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
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
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* Page Numbers */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "contained" : "outlined"}
                  onClick={() => handlePageChange(index + 1)}
                  sx={{
                    minWidth: '40px',
                    height: '40px',
                    backgroundColor: currentPage === index + 1 ? 'primary.main' : 'transparent'
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>

            {/* Previous/Next Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Typography variant="body1">
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </div>
    </Layout>
  );
}

export default Wallet;