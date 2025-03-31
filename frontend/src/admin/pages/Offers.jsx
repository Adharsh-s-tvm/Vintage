import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Modal, FormControl, InputLabel, Select, MenuItem, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Paper, TablePagination } from '@mui/material';
import { Add, Search, Edit, Block, CheckCircle } from '@mui/icons-material';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { addOfferApi, fetchAffectedProductsApi, fetchOffersApi, offerFetchCategoriesApi, offerFetchProductsApi, toggleOfferStatusApi, updateOfferApi, fetchAffectedCategoriesApi } from '../../services/api/adminApis/offerApi';

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
  const [expandedRows, setExpandedRows] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await offerFetchProductsApi();
      console.log('Fetched products:', response.data.products);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await offerFetchCategoriesApi();
      console.log('Fetched categories:', response.data.categories);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchOffers = async () => {
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

      const response = await fetchOffersApi(params);
      setOffers(response.data.offers);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.offerName || !formData.offerType || !formData.discountPercentage || !formData.startDate || !formData.endDate || !formData.items.length) {
        toast.error('Please fill in all required fields');
        return;
      }

      const formattedData = {
        ...formData,
        discountPercentage: Number(formData.discountPercentage)
      };

      let response;
      if (isEditMode) {
        response = await updateOfferApi(editOfferId, formattedData);
        toast.success('Offer updated successfully');
      } else {
        response = await addOfferApi(formattedData);
        toast.success('Offer added successfully');
      }

      setShowModal(false);
      fetchOffers();
      resetForm();
      setIsEditMode(false);
      setEditOfferId(null);
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} offer`);
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

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditOfferId(null);
    resetForm();
  };

  const handleEditOffer = async (offerId, updatedData) => {
    try {
      const response = await updateOfferApi(offerId, updatedData);
      toast.success('Offer updated successfully');
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update offer');
    }
  };

  const handleBlockOffer = async (offerId) => {
    try {
      const response = await toggleOfferStatusApi(offerId);
      toast.success('Offer status updated successfully');
      fetchOffers(); // Refresh the offers list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update offer status');
    }
  };

  const OfferDetails = ({ offer }) => {
    const [affectedItems, setAffectedItems] = useState([]);
    
    useEffect(() => {
      const fetchAffectedItems = async () => {
        try {
          const response = offer.offerType === 'product' 
            ? await fetchAffectedProductsApi(offer._id)
            : await fetchAffectedCategoriesApi(offer._id);
          setAffectedItems(response.data);
        } catch (error) {
          console.error('Error fetching affected items:', error);
        }
      };
      
      fetchAffectedItems();
    }, [offer._id, offer.offerType]);

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Applied to {affectedItems.length} {offer.offerType === 'category' ? 'categories' : 'products'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {offer.offerType === 'category' ? 'Category-wide offer' : 'Product-specific offer'}
        </Typography>
      </Box>
    );
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
        onClose={handleCloseModal}
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
            {isEditMode ? 'Edit Offer' : 'Add New Offer'}
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
            <Button variant="outlined" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEditMode ? 'Update Offer' : 'Save Offer'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Offer Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Discount %</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer._id}>
                <TableCell>{offer.offerName}</TableCell>
                <TableCell>{offer.offerType}</TableCell>
                <TableCell>{offer.discountPercentage}%</TableCell>
                <TableCell>{new Date(offer.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(offer.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={offer.isActive ? 'Active' : 'Blocked'}
                    color={offer.isActive ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      color="primary"
                      onClick={() => {
                        setIsEditMode(true);
                        setEditOfferId(offer._id);
                        
                        console.log('Editing offer:', offer);
                        
                        // Handle items based on offer type
                        let formattedItems;
                        if (offer.offerType === 'category') {
                          formattedItems = offer.items.map(item => {
                            console.log('Processing category item:', item);
                            if (typeof item === 'string') return item;
                            return item.category || item._id || item.categoryId;
                          });
                        } else {
                          formattedItems = offer.items.map(item => {
                            console.log('Processing product item:', item);
                            if (typeof item === 'string') return item;
                            return item._id || item.productId;
                          });
                        }
                        
                        console.log('Final formatted items:', formattedItems);
                        
                        setFormData({
                          offerName: offer.offerName,
                          offerType: offer.offerType,
                          discountPercentage: offer.discountPercentage,
                          startDate: offer.startDate.split('T')[0],
                          endDate: offer.endDate.split('T')[0],
                          items: formattedItems
                        });
                        setShowModal(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color={offer.isActive ? "error" : "success"}
                      onClick={() => handleBlockOffer(offer._id)}
                    >
                      {offer.isActive ? <Block /> : <CheckCircle />}
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

export default Offers;