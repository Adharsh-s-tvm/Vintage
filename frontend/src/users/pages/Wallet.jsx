import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Person, AccountBalance, History, NavigateBefore, NavigateNext } from '@mui/icons-material';
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
      <Box sx={{ 
        maxWidth: '1200px', 
        mx: 'auto', 
        p: 4,
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        minHeight: '90vh'
      }}>
        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={() => navigate('/profile')}
            sx={{ 
              borderRadius: 2,
              px: 3,
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            Back to Profile
          </Button>
          <Button
            variant="contained"
            endIcon={<ShoppingBag />}
            onClick={() => navigate('/products')}
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
            }}
          >
            Continue Shopping
          </Button>
        </Box>

        {/* Wallet Balance Card */}
        <Card sx={{ 
          mb: 4,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalance sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Wallet Balance
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700,
              color: '#4caf50',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              ₹{wallet.balance.toLocaleString('en-IN')}
            </Typography>
          </CardContent>
        </Card>

        {/* Transaction History Section */}
        <Card sx={{ borderRadius: 3, mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <History sx={{ mr: 2, color: '#666' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Transaction History ({totalTransactions} transactions)
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }} align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No transactions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow 
                        key={transaction._id}
                        sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                      >
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'credit' ? 'success' : 'error'}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              minWidth: 80,
                              borderRadius: 1
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{
                          color: transaction.type === 'credit' ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}>
                          ₹{transaction.amount.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              backgroundColor: 'white',
              padding: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                sx={{ borderRadius: 2 }}
              >
                Previous
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1, mx: 2 }}>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "contained" : "outlined"}
                    onClick={() => handlePageChange(index + 1)}
                    sx={{
                      minWidth: '40px',
                      height: '40px',
                      borderRadius: 1,
                      background: currentPage === index + 1 ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : 'transparent'
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Box>

              <Button
                variant="outlined"
                endIcon={<NavigateNext />}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                sx={{ borderRadius: 2 }}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export default Wallet;