import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Modal } from 'react-bootstrap';
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Snackbar,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Chip
} from "@mui/material";
import { ExpandMore, Search, Add, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toast } from 'sonner';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const API_BASE_URL = 'http://localhost:7000/api/admin';

const Products = () => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    brand: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variantData, setVariantData] = useState({
    size: '',
    color: '',
    stock: '',
    price: '',
    mainImage: null,
    subImages: {}
  });
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState({
    main: null,
    sub1: null,
    sub2: null,
    sub3: null
  });
  const [expandedRows, setExpandedRows] = useState({});
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [itemToBlock, setItemToBlock] = useState(null);
  const [blockType, setBlockType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [variantFormData, setVariantFormData] = useState({
    size: '',
    color: '',
    stock: 0,
    price: 0
  });
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropConfig, setCropConfig] = useState({
    image: null,
    imageType: '', // 'main' or 'sub1', 'sub2', 'sub3'
    crop: {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
      aspect: undefined // Remove forced aspect ratio
    }
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [formErrors, setFormErrors] = useState({
    size: '',
    color: '',
    stock: '',
    price: '',
    mainImage: '',
    subImages: ''
  });
  const [editVariantImagePreview, setEditVariantImagePreview] = useState({
    main: null,
    sub1: null,
    sub2: null,
    sub3: null
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup preview URLs
      Object.values(imagePreview).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreview]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products
        .filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/brands`);
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to fetch brands');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      console.log('Products data:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products/add`, formData);
      toast.success('Product added successfully');
      setShowProductModal(false);
      setFormData({
        name: '',
        category: '',
        description: '',
        brand: ''
      });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleVariantChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'mainImage' && files[0]) {
      setVariantData(prev => ({
        ...prev,
        mainImage: files[0]
      }));
      setImagePreview(prev => ({
        ...prev,
        main: URL.createObjectURL(files[0])
      }));
    } else if (name.startsWith('subImage')) {
      const index = name.slice(-1);
      if (files[0]) {
        setVariantData(prev => ({
          ...prev,
          subImages: {
            ...prev.subImages,
            [index]: files[0]
          }
        }));
        setImagePreview(prev => ({
          ...prev,
          [`sub${index}`]: URL.createObjectURL(files[0])
        }));
      }
    } else {
      setVariantData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateVariantData = () => {
    const errors = {};

    // Check for empty fields
    if (!variantData.size.trim()) errors.size = 'Size is required';
    if (!variantData.color.trim()) errors.color = 'Color is required';
    if (!variantData.stock || variantData.stock <= 0) errors.stock = 'Valid stock quantity is required';
    if (!variantData.price || variantData.price <= 0) errors.price = 'Valid price is required';
    if (!variantData.mainImage) errors.mainImage = 'Main image is required';

    // Check if at least one sub image is uploaded
    const hasSubImages = Object.values(variantData.subImages).some(img => img !== null);
    if (!hasSubImages) errors.subImages = 'At least one sub image is required';

    // Check for duplicate size
    if (selectedProduct && variantData.size) {
      const isDuplicateSize = selectedProduct.variants.some(
        variant =>
          variant.size.toLowerCase() === variantData.size.toLowerCase() &&
          (!selectedVariant || variant._id !== selectedVariant._id)
      );
      if (isDuplicateSize) errors.size = 'This size variant already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVariantSubmit = async () => {
    if (!validateVariantData()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append basic data
      formData.append('product', selectedProduct._id);
      formData.append('size', variantData.size);
      formData.append('color', variantData.color);
      formData.append('stock', variantData.stock);
      formData.append('price', variantData.price);

      // Append main image
      if (variantData.mainImage) {
        formData.append('mainImage', variantData.mainImage);
      }

      // Append sub images
      Object.values(variantData.subImages).forEach((file) => {
        if (file) {
          formData.append('subImages', file);
        }
      });

      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `${API_BASE_URL}/products/variant/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // Update products state
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            if (product._id === selectedProduct._id) {
              return {
                ...product,
                variants: [...product.variants, response.data.variant]
              };
            }
            return product;
          });
        });

        toast.success('Variant added successfully');
        handleCloseVariantModal();
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error(error.response?.data?.message || 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async () => {
    try {
      // Add validation
      if (!formData.name || !formData.category || !formData.brand || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Log the request details for debugging
      console.log('Updating product:', selectedProduct._id, formData);

      const response = await axios.put(
        `${API_BASE_URL}/products/${selectedProduct._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Check if the update was successful
      if (response.data) {
        toast.success('Product updated successfully');
        setShowProductModal(false);
        setEditMode(false);
        setFormData({
          name: '',
          category: '',
          description: '',
          brand: ''
        });
        await fetchProducts(); // Refresh the products list
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleRowExpand = (productId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCloseBlock = () => {
    setBlockConfirmOpen(false);
    setItemToBlock(null);
    setBlockType('');
  };

  const handleConfirmBlock = async () => {
    try {
      if (blockType === 'product') {
        await handleBlockProduct(itemToBlock._id, itemToBlock.isBlocked);
      } else if (blockType === 'variant') {
        await handleBlockVariant(itemToBlock._id, itemToBlock.isBlocked);
      }
      handleCloseBlock();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBlockProduct = async (productId, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/products/product/${productId}/block`, {
        isBlocked: !currentStatus
      });
      toast.success(`Product ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleBlockVariant = async (variantId, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/products/variant/${variantId}/block`, {
        isBlocked: !currentStatus
      });
      toast.success(`Variant ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update variant status');
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/products/${productId}/status`, {
        isListed: !currentStatus
      });
      toast.success('Product status updated successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleEditVariant = async () => {
    try {
      const formData = new FormData();
      
      // Append basic data
      formData.append('size', variantFormData.size);
      formData.append('color', variantFormData.color);
      formData.append('stock', variantFormData.stock);
      formData.append('price', variantFormData.price);

      // Append images if they were changed
      if (variantFormData.mainImage instanceof File) {
        formData.append('mainImage', variantFormData.mainImage);
      }
      
      if (variantFormData.subImages) {
        Object.values(variantFormData.subImages).forEach(file => {
          if (file instanceof File) {
            formData.append('subImages', file);
          }
        });
      }

      await axios.put(
        `${API_BASE_URL}/products/variant/${selectedVariant._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Variant updated successfully');
      setShowEditVariantModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update variant');
    }
  };

  const handleEditVariantImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setVariantFormData(prev => ({
        ...prev,
        [type]: file
      }));
      
      const previewUrl = URL.createObjectURL(file);
      setEditVariantImagePreview(prev => ({
        ...prev,
        [type === 'mainImage' ? 'main' : type]: previewUrl
      }));
    }
  };

  const BlockConfirmDialog = ({ open, handleClose, handleConfirm, itemType }) => (
    <Modal show={open} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to {itemToBlock?.isBlocked ? 'unblock' : 'block'} this {itemType}?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={itemToBlock?.isBlocked ? "primary" : "error"}
          onClick={handleConfirm}
        >
          {itemToBlock?.isBlocked ? 'Unblock' : 'Block'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const ProductActionButton = ({ product }) => (
    <Button
      variant="contained"
      size="small"
      color={product.isBlocked ? 'primary' : 'error'}
      onClick={() => {
        setItemToBlock(product);
        setBlockType('product');
        setBlockConfirmOpen(true);
      }}
    >
      {product.isBlocked ? 'Unblock' : 'Block'}
    </Button>
  );

  const VariantActionButton = ({ variant }) => (
    <Button
      variant="contained"
      size="small"
      color={variant.isBlocked ? 'primary' : 'error'}
      onClick={() => {
        setItemToBlock(variant);
        setBlockType('variant');
        setBlockConfirmOpen(true);
      }}
    >
      {variant.isBlocked ? 'Unblock' : 'Block'}
    </Button>
  );

  const Pagination = () => (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => setPage(prev => Math.max(prev - 1, 0))}
        disabled={page === 0}
        className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
      >
        Previous
      </button>
      <span className="px-3 py-1">
        Page {page + 1} of {Math.ceil(filteredProducts.length / rowsPerPage)}
      </span>
      <button
        onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / rowsPerPage) - 1))}
        disabled={page >= Math.ceil(filteredProducts.length / rowsPerPage) - 1}
        className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
      >
        Next
      </button>
    </div>
  );

  // Function to handle initial image selection
  const handleImageSelect = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropConfig({
          image: reader.result,
          imageType: name,
          crop: {
            unit: '%',
            width: 90,
            height: 90,
            x: 5,
            y: 5,
            aspect: undefined // Remove forced aspect ratio
          }
        });
        setShowCropModal(true);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Function to generate cropped image
  const getCroppedImg = async (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpeg';
        const croppedFile = new File([blob], 'cropped.jpeg', { type: 'image/jpeg' });
        resolve(croppedFile);
      }, 'image/jpeg', 1);
    });
  };

  // Function to handle crop completion
  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);

      // Update variant data and preview based on image type
      if (cropConfig.imageType === 'mainImage') {
        setVariantData(prev => ({
          ...prev,
          mainImage: croppedFile
        }));
        setImagePreview(prev => ({
          ...prev,
          main: URL.createObjectURL(croppedFile)
        }));
      } else {
        const index = cropConfig.imageType.slice(-1);
        setVariantData(prev => ({
          ...prev,
          subImages: {
            ...prev.subImages,
            [index]: croppedFile
          }
        }));
        setImagePreview(prev => ({
          ...prev,
          [`sub${index}`]: URL.createObjectURL(croppedFile)
        }));
      }

      setShowCropModal(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    }
  };

  // Function to reset variant form data
  const resetVariantForm = () => {
    setVariantData({
      size: '',
      color: '',
      stock: '',
      price: '',
      mainImage: null,
      subImages: {}
    });
    setFormErrors({
      size: '',
      color: '',
      stock: '',
      price: '',
      mainImage: '',
      subImages: ''
    });
    setImagePreview({
      main: null,
      sub1: null,
      sub2: null,
      sub3: null
    });
    setSelectedVariant(null);
  };

  // Function to handle modal close
  const handleCloseVariantModal = () => {
    resetVariantForm();
    setShowVariantModal(false);
    // Cleanup any existing image preview URLs
    Object.values(imagePreview).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
  };

  // Function to handle modal open
  const handleOpenVariantModal = (product) => {
    setSelectedProduct(product);
    setShowVariantModal(true);
  };

  // Update your existing button/trigger that opens the variant modal
  const renderAddVariantButton = (product) => (
    <Button
      variant="contained"
      size="small"
      onClick={() => handleOpenVariantModal(product)}
      startIcon={<Add />}
    >
      Add Variant
    </Button>
  );

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#3f51b5",
          borderRadius: 2,
          padding: 2,
          marginBottom: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
          Products Management
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#2e7d32", // Dark green
            color: "white",
            '&:hover': {
              backgroundColor: "#1b5e20"
            },
            fontWeight: 'bold',
            boxShadow: 2
          }}
          onClick={() => setShowProductModal(true)}
        >
          Add New Product
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 1,
            width: "250px",
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: "#3f51b5" },
              '&:hover fieldset': { borderColor: "#3f51b5" },
              '&.Mui-focused fieldset': { borderColor: "#3f51b5" },
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton>
                <Search />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Update Table section */}
      <TableContainer
        component={Paper}
        sx={{
          mb: 2,
          boxShadow: 3,
          borderRadius: 2,
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: '0 8px' // Add spacing between rows
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{
              background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
              '& th': {
                color: "white",
                fontWeight: 'bold',
                fontSize: '1rem',
                padding: '16px',
                borderBottom: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              },
              '& th:first-of-type': { borderTopLeftRadius: 8 },
              '& th:last-child': { borderTopRightRadius: 8 }
            }}>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
              <TableCell align="center">Variants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No products found</TableCell>
              </TableRow>
            ) : (
              filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product, index) => (
                  <React.Fragment key={product._id}>
                    <TableRow
                      sx={{
                        background: index % 2 === 0
                          ? 'linear-gradient(to right, #ffffff, #f8f9fa)'
                          : 'linear-gradient(to right, #f5f5f5, #e9ecef)',
                        '&:hover': {
                          background: 'linear-gradient(to right, #e3f2fd, #bbdefb)',
                          transform: 'scale(1.002)',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        },
                        '& td': {
                          padding: '16px',
                          border: 'none',
                          borderBottom: '1px solid rgba(224, 224, 224, 0.4)'
                        }
                      }}
                    >
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {typeof product.category === 'object'
                          ? product.category?.name
                          : categories.find(cat => cat._id === product.category)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {typeof product.brand === 'object'
                          ? product.brand?.name
                          : brands.find(brand => brand._id === product.brand)?.name || 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.isBlocked ? 'Blocked' : 'Active'}
                          color={product.isBlocked ? 'error' : 'success'}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: '80px',
                            background: product.isBlocked
                              ? 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)'
                              : 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)',
                            color: 'white',
                            '& .MuiChip-label': {
                              color: 'white'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center',
                          '& .MuiButton-root': {
                            minWidth: '100px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: 2
                          }
                        }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowVariantModal(true);
                            }}
                            sx={{
                              backgroundColor: "#00796b", // Teal
                              '&:hover': {
                                backgroundColor: "#004d40",
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            Add Variant
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "#1565c0", // Blue
                              '&:hover': {
                                backgroundColor: "#0d47a1",
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              setSelectedProduct(product);
                              setFormData({
                                name: product.name,
                                category: product.category._id,
                                brand: product.brand._id,
                                description: product.description
                              });
                              setEditMode(true);
                              setShowProductModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <ProductActionButton product={product} />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRowExpand(product._id)}
                          sx={{
                            backgroundColor: expandedRows[product._id] ? '#e3f2fd' : 'transparent',
                            '&:hover': {
                              backgroundColor: '#bbdefb'
                            }
                          }}
                        >
                          {expandedRows[product._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedRows[product._id]} timeout="auto" unmountOnExit>
                          <Box sx={{
                            margin: 2,
                            backgroundColor: '#f3f6f9',
                            borderRadius: 2,
                            p: 2,
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              component="div"
                              sx={{
                                color: '#1565c0',
                                fontWeight: 'bold',
                                marginBottom: 2
                              }}
                            >
                              Product Variants
                            </Typography>
                            <Table
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                borderRadius: 1,
                                overflow: 'hidden',
                                boxShadow: 1
                              }}
                            >
                              <TableHead>
                                <TableRow sx={{
                                  backgroundColor: '#1976d2',
                                  '& th': {
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                  }
                                }}>
                                  <TableCell>Size</TableCell>
                                  <TableCell>Color</TableCell>
                                  <TableCell>Stock</TableCell>
                                  <TableCell>Price</TableCell>
                                  <TableCell align="center">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {product.variants.map((variant) => (
                                  <TableRow
                                    key={variant._id}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                        transform: 'scale(1.001)',
                                        transition: 'all 0.2s ease'
                                      }
                                    }}
                                  >
                                    <TableCell>{variant.size}</TableCell>
                                    <TableCell>{variant.color}</TableCell>
                                    <TableCell>{variant.stock}</TableCell>
                                    <TableCell>₹{variant.price}</TableCell>
                                    <TableCell align="center">
                                      <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <Chip
                                          label={variant.isBlocked ? 'Blocked' : 'Active'}
                                          color={variant.isBlocked ? 'error' : 'success'}
                                          size="small"
                                          sx={{
                                            fontWeight: 'bold',
                                            minWidth: '80px',
                                            background: variant.isBlocked
                                              ? 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)'
                                              : 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)',
                                            color: 'white'
                                          }}
                                        />
                                        <Button
                                          variant="contained"
                                          size="small"
                                          sx={{
                                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                                            color: 'white',
                                            '&:hover': {
                                              background: 'linear-gradient(45deg, #0d47a1 30%, #1565c0 90%)',
                                              transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.2s'
                                          }}
                                          onClick={() => {
                                            setSelectedVariant(variant);
                                            setVariantFormData({
                                              size: variant.size,
                                              color: variant.color,
                                              stock: variant.stock,
                                              price: variant.price
                                            });
                                            setShowEditVariantModal(true);
                                          }}
                                        >
                                          Edit
                                        </Button>
                                        <VariantActionButton variant={variant} />
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination />
      </Box>

      {/* Snackbar */}
      <Snackbar open={false} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success">Action successful</Alert>
      </Snackbar>

      {/* Update Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            margin="normal"
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
            >
              {categories.filter(cat => cat.status === 'listed').map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Brand</InputLabel>
            <Select
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              label="Brand"
            >
              {brands.filter(brand => brand.status === 'listed').map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            margin="normal"
            multiline
            rows={3}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={editMode ? handleEditProduct : handleSubmit}>
            {editMode ? 'Update Product' : 'Save Product'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Variant Modal */}
      <Modal
        show={showVariantModal}
        onHide={handleCloseVariantModal}
        centered
        size="lg"
        backdrop="static" // Prevents closing by clicking outside
        keyboard={false} // Prevents closing by pressing Esc key
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Product Variant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            fullWidth
            label="Size"
            name="size"
            value={variantData.size}
            onChange={(e) => {
              setVariantData(prev => ({
                ...prev,
                size: e.target.value
              }));
              setFormErrors(prev => ({ ...prev, size: '' }));
            }}
            error={!!formErrors.size}
            helperText={formErrors.size}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Color"
            name="color"
            value={variantData.color}
            onChange={(e) => {
              setVariantData(prev => ({
                ...prev,
                color: e.target.value
              }));
              setFormErrors(prev => ({ ...prev, color: '' }));
            }}
            error={!!formErrors.color}
            helperText={formErrors.color}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Stock"
            name="stock"
            type="number"
            value={variantData.stock}
            onChange={(e) => {
              setVariantData(prev => ({
                ...prev,
                stock: e.target.value
              }));
              setFormErrors(prev => ({ ...prev, stock: '' }));
            }}
            error={!!formErrors.stock}
            helperText={formErrors.stock}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={variantData.price}
            onChange={(e) => {
              setVariantData(prev => ({
                ...prev,
                price: e.target.value
              }));
              setFormErrors(prev => ({ ...prev, price: '' }));
            }}
            error={!!formErrors.price}
            helperText={formErrors.price}
            margin="normal"
            required
          />

          {/* Image upload sections */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Main Image <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 1,
                mb: 1,
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {imagePreview.main ? (
                <img
                  src={imagePreview.main}
                  alt="Main preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Typography color="textSecondary">Drop or click to upload main image</Typography>
              )}
              <input
                type="file"
                name="mainImage"
                accept="image/*"
                onChange={handleImageSelect}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </Box>
            {formErrors.mainImage && (
              <Typography color="error" variant="caption">
                {formErrors.mainImage}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Sub Images <span style={{ color: 'red' }}>*</span>
              <Typography variant="caption" color="textSecondary">
                (At least one sub image required)
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3].map((num) => (
                <Box
                  key={num}
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 1,
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {imagePreview[`sub${num}`] ? (
                    <img
                      src={imagePreview[`sub${num}`]}
                      alt={`Sub ${num} preview`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">Image {num}</Typography>
                  )}
                  <input
                    type="file"
                    name={`subImage${num}`}
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </Box>
              ))}
            </Box>
            {formErrors.subImages && (
              <Typography color="error" variant="caption">
                {formErrors.subImages}
              </Typography>
            )}
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVariantModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleVariantSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Variant'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Block Confirmation Dialog */}
      <BlockConfirmDialog
        open={blockConfirmOpen}
        handleClose={handleCloseBlock}
        handleConfirm={handleConfirmBlock}
        itemType={blockType}
      />

      {/* Edit Variant Modal */}
      <Modal show={showEditVariantModal} onHide={() => setShowEditVariantModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Variant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <TextField
                fullWidth
                label="Size"
                name="size"
                value={variantFormData.size}
                onChange={(e) => setVariantFormData(prev => ({
                  ...prev,
                  size: e.target.value
                }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={variantFormData.color}
                onChange={(e) => setVariantFormData(prev => ({
                  ...prev,
                  color: e.target.value
                }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={variantFormData.stock}
                onChange={(e) => setVariantFormData(prev => ({
                  ...prev,
                  stock: Number(e.target.value)
                }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={variantFormData.price}
                onChange={(e) => setVariantFormData(prev => ({
                  ...prev,
                  price: Number(e.target.value)
                }))}
                margin="normal"
              />
            </div>

            <div>
              <Typography variant="subtitle1" gutterBottom>
                Main Image
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 1,
                  mb: 2,
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {(editVariantImagePreview.main || selectedVariant?.mainImage) && (
                  <img
                    src={editVariantImagePreview.main || selectedVariant?.mainImage}
                    alt="Main variant"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditVariantImageChange(e, 'mainImage')}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Sub Images
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3].map((num) => (
                  <Box
                    key={num}
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 1,
                      width: '100px',
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    {(editVariantImagePreview[`sub${num}`] || 
                      (selectedVariant?.subImages && selectedVariant.subImages[num-1])) && (
                      <img
                        src={editVariantImagePreview[`sub${num}`] || selectedVariant.subImages[num-1]}
                        alt={`Sub ${num}`}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditVariantImageChange(e, `sub${num}`)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditVariantModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditVariant}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Crop Modal */}
      <Modal
        show={showCropModal}
        onHide={(e) => {
          if (e && e.target.classList.contains('modal')) {
            return;
          }
          setShowCropModal(false);
        }}
        centered
        size="md"
        backdrop="static" // Prevents closing when clicking outside
        keyboard={false}  // Prevents closing with keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cropConfig.image && (
            <div>
              <ReactCrop
                crop={cropConfig.crop}
                onChange={(c) => setCropConfig(prev => ({ ...prev, crop: c }))}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined} // Remove forced aspect ratio
                circularCrop={false}
              >
                <img
                  ref={imgRef}
                  src={cropConfig.image}
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                  alt="Crop preview"
                />
              </ReactCrop>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Drag to crop the image. You can freely adjust the crop area.
              </Typography>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCropModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCropComplete}>
            Apply Crop
          </Button>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default Products;














