import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Person } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Layout } from '../layout/Layout';

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/user/profile/wallet`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        withCredentials: true
      });
      
      if (response.data) {
        setWallet(response.data);
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

        {/* Transaction History */}
        <Typography variant="h6" className="text-blue-400 mb-2">
          Transaction History
        </Typography>

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wallet?.transactions.map((transaction) => (
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Layout>
  );
}

export default Wallet;