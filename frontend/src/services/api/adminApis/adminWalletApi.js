import { privateAPI } from '../api';

export const getWalletTransactions = async (params) => {
  try {
    const response = await privateAPI.get('/admin/wallet/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
};

// Get transaction details by ID
export const getTransactionDetails = async (transactionId) => {
  try {
    const response = await privateAPI.get(`/admin/wallet/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};