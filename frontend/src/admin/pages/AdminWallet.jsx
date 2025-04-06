import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Tag, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { getWalletTransactions, getTransactionDetails } from '../../services/api/adminApis/adminWalletApi';
import moment from 'moment';

function AdminWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalWalletAmount, setTotalWalletAmount] = useState(0);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getWalletTransactions({
        page,
        limit: pagination.pageSize
      });
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        const totalAmount = response.data.transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        setTotalWalletAmount(totalAmount);
        setPagination({
          ...pagination,
          current: response.data.pagination.currentPage,
          total: response.data.pagination.totalTransactions,
          pageSize: response.data.pagination.limit
        });
      } else {
        message.error('Invalid response format');
      }
    } catch (error) {
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTableChange = (pagination) => {
    fetchTransactions(pagination.current);
  };

  const handleViewDetails = async (transactionId) => {
    try {
      const details = await getTransactionDetails(transactionId);
      setSelectedTransaction(details);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch transaction details');
    }
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'credit' ? 'green' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.transactionId)}
        >
          View Details
        </Button>
      )
    }
  ];

  return (

      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wallet Transactions</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Wallet Amount</p>
          <p className={`text-xl font-bold ${totalWalletAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{totalWalletAmount.toFixed(2)}
          </p>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="transactionId"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title="Transaction Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">User Information</h3>
              <p>Name: {selectedTransaction.user.name}</p>
              <p>Email: {selectedTransaction.user.email}</p>
              <p>Phone: {selectedTransaction.user.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Transaction Details</h3>
              <p>Transaction ID: {selectedTransaction.transactionId}</p>
              <p>Date: {moment(selectedTransaction.date).format('YYYY-MM-DD HH:mm:ss')}</p>
              <p>Type: <Tag color={selectedTransaction.type === 'credit' ? 'green' : 'red'}>
                {selectedTransaction.type.toUpperCase()}
              </Tag></p>
              <p>Amount: ₹{selectedTransaction.amount.toFixed(2)}</p>
              <p>Description: {selectedTransaction.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminWallet;