import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Modal, FormControl, InputLabel, Select, MenuItem, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Paper, TablePagination } from '@mui/material';
import { Add, Search, Edit, Block, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/apiCall';

function Coupons() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    couponCode: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    minOrderAmount: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', rowsPerPage.toString());
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (filter !== 'all') {
        params.set('filter', filter);
      }

      // Update URL parameters
      setSearchParams(params);

      const response = await axios.get(`${api}/admin/coupons?${params}`);
      setCoupons(response.data.coupons);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [searchParams]);

  const generateCouponCode = () => {
    const prefix = 'SHOP';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const couponCode = `${prefix}${randomPart}`;
    setFormData({ ...formData, couponCode });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.couponCode || !formData.discountType || !formData.discountValue || 
          !formData.startDate || !formData.endDate || !formData.minOrderAmount) {
        toast.error('Please fill in all required fields');
        return;
      }

      const formattedData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount)
      };

      let response;
      if (isEditMode) {
        response = await axios.put(`http://localhost:7000/api/admin/coupons/${editCouponId}`, formattedData);
        toast.success('Coupon updated successfully');
      } else {
        response = await axios.post('http://localhost:7000/api/admin/coupons', formattedData);
        toast.success('Coupon added successfully');
      }

      setShowModal(false);
      fetchCoupons();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleBlockCoupon = async (couponId) => {
    try {
      await axios.patch(`http://localhost:7000/api/admin/coupons/${couponId}/toggle-status`);
      toast.success('Coupon status updated successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const resetForm = () => {
    setFormData({
      couponCode: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      minOrderAmount: ''
    });
    setIsEditMode(false);
    setEditCouponId(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('search', searchQuery);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1 className='text-2xl font-bold'>Coupons</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowModal(true)}
          className='bg-green-500'
        >
          Add a Coupon
        </Button>
        <TextField
          placeholder="Search coupons..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
          width: '90%',
          maxWidth: 500
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEditMode ? 'Edit Coupon' : 'Add New Coupon'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Coupon Code"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
            />
            <Button
              variant="contained"
              onClick={generateCouponCode}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Generate
            </Button>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Discount Type</InputLabel>
            <Select
              value={formData.discountType}
              label="Discount Type"
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            >
              <MenuItem value="percentage">Percentage</MenuItem>
              <MenuItem value="fixed">Fixed Amount</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={`Discount Value (${formData.discountType === 'percentage' ? '%' : 'Amount'})`}
            type="number"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ 
              inputProps: { 
                min: 0,
                max: formData.discountType === 'percentage' ? 100 : 999999
              } 
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            fullWidth
            label="Minimum Order Amount"
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => {
              setShowModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEditMode ? 'Update Coupon' : 'Add Coupon'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Coupon Code</TableCell>
              <TableCell>Discount Type</TableCell>
              <TableCell>Discount Value</TableCell>
              <TableCell>Min Order Amount</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon._id}>
                <TableCell>{coupon.couponCode}</TableCell>
                <TableCell>{coupon.discountType}</TableCell>
                <TableCell>
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : `₹${coupon.discountValue}`}
                </TableCell>
                <TableCell>₹{coupon.minOrderAmount}</TableCell>
                <TableCell>{new Date(coupon.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(coupon.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={coupon.isExpired ? 'Expired' : 'Active'}
                    color={coupon.isExpired ? 'error' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setIsEditMode(true);
                        setEditCouponId(coupon._id);
                        setFormData({
                          couponCode: coupon.couponCode,
                          discountType: coupon.discountType,
                          discountValue: coupon.discountValue,
                          startDate: coupon.startDate.split('T')[0],
                          endDate: coupon.endDate.split('T')[0],
                          minOrderAmount: coupon.minOrderAmount
                        });
                        setShowModal(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color={coupon.isExpired ? "success" : "error"}
                      onClick={() => handleBlockCoupon(coupon._id)}
                    >
                      {coupon.isExpired ? <CheckCircle /> : <Block />}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalPages * rowsPerPage}
          rowsPerPage={rowsPerPage}
          page={currentPage - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

export default Coupons;