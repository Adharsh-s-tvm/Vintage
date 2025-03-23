import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Modal, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'sonner';

function Offers() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    offerName: '',
    offerType: 'product',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    items: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:7000/api/admin/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:7000/api/admin/products/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axios.get('http://localhost:7000/api/admin/offers');
      setOffers(response.data);
    } catch (error) {
      toast.error('Failed to fetch offers');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:7000/api/admin/offers', formData);
      toast.success('Offer added successfully');
      setShowModal(false);
      fetchOffers();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add offer');
    }
  };

  const resetForm = () => {
    setFormData({
      offerName: '',
      offerType: 'product',
      discountPercentage: '',
      startDate: '',
      endDate: '',
      items: []
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <h1 className='text-2xl font-bold'>Offers</h1>
        <Button
          className='bg-green-500 text-white '
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowModal(true)}
        >
          Add an Offer
        </Button>
        <TextField
          placeholder="Search offers..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Add Offer Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="add-offer-modal"
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
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Add New Offer
          </Typography>
          
          <TextField
            fullWidth
            label="Offer Name"
            value={formData.offerName}
            onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Offer Type</InputLabel>
            <Select
              value={formData.offerType}
              label="Offer Type"
              onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
            >
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Discount Percentage"
            type="number"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 1, max: 100 } }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select {formData.offerType === 'product' ? 'Products' : 'Categories'}</InputLabel>
            <Select
              multiple
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              label={`Select ${formData.offerType === 'product' ? 'Products' : 'Categories'}`}
            >
              {formData.offerType === 'product' 
                ? products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name}
                    </MenuItem>
                  ))
                : categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))
              }
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Save Offer
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default Offers;