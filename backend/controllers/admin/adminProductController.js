import Product from "../../models/product/productModel.js";
import Variant from "../../models/product/sizeVariantModel.js";
import Category from "../../models/product/categoryModel.js";
import Brand from "../../models/product/brandModel.js";

// @desc    Add a new product
// @route   POST /api/products/add
// @access  Admin
export const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Fetch the saved product with populated fields
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('brand', 'name');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('variants');

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const addVariant = async (req, res) => {
  try {
    const { size, color, stock, price, product } = req.body;
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    // Validate required fields
    if (!product || !size || !color || !stock || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Get image URLs with fallback
    let mainImageUrl = '';
    let subImageUrls = [];

    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) {
        mainImageUrl = req.files.mainImage[0].path || req.files.mainImage[0].secure_url;
      }
      if (req.files.subImages) {
        subImageUrls = req.files.subImages.map(file => file.path || file.secure_url);
      }
    }

    // Create new variant
    const newVariant = new Variant({
      product,
      size,
      color,
      stock: Number(stock),
      price: Number(price),
      mainImage: mainImageUrl,
      subImages: subImageUrls
    });

    const savedVariant = await newVariant.save();
    await Product.findByIdAndUpdate(
      product,
      { $push: { variants: savedVariant._id } }
    );

    const populatedVariant = await Variant.findById(savedVariant._id)
      .populate('product', 'name');

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      variant: populatedVariant
    });

  } catch (error) {
    console.error('Error in addVariant:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add variant'
    });
  }
};

// @desc    Add a new category
// @route   POST /api/products/category/add
// @access  Admin
export const addCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const newCategory = new Category({
    name,
    status: "listed"
  });

  const savedCategory = await newCategory.save();
  res.status(201).json(savedCategory);
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.status(200).json(categories);
};

// @desc    Update category status
// @route   PUT /api/products/category/:id/status
// @access  Admin
export const updateCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['listed', 'Not listed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.status = status;
  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
};

// @desc    Update category name
// @route   PUT /api/products/category/:id
// @access  Admin
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  // Check if the new name already exists for other categories
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    _id: { $ne: id } // Exclude current category from check
  });

  if (existingCategory) {
    return res.status(400).json({ message: "Category name already exists" });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.name = name;
  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
};

export const addBrand = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Brand name is required" });
  }

  // Check if brand already exists
  const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingBrand) {
    return res.status(400).json({ message: "Brand already exists" });
  }

  const newBrand = new Brand({
    name,
    status: "listed"
  });

  const savedBrand = await newBrand.save();
  res.status(201).json(savedBrand);
};

export const getAllBrands = async (req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  res.status(200).json(brands);
};

export const updateBrandStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['listed', 'Not listed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  brand.status = status;
  const updatedBrand = await brand.save();
  res.status(200).json(updatedBrand);
};

export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Brand name is required" });
  }

  const existingBrand = await Brand.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    _id: { $ne: id }
  });

  if (existingBrand) {
    return res.status(400).json({ message: "Brand name already exists" });
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  brand.name = name;
  const updatedBrand = await brand.save();
  res.status(200).json(updatedBrand);
};

// Add a controller to get variants for a specific product
export const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const variants = await Variant.find({ product: productId })
      .populate('product', 'name');

    res.status(200).json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ message: 'Error fetching variants' });
  }
};

// Add a controller to update product
export const updateProduct = async (req, res) => {
  console.log('Update Prodict')
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input data
    if (!updateData.name || !updateData.category || !updateData.brand) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Log the update operation
    console.log('Updating product:', id, updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name')
      .populate('brand', 'name');

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Log the updated product
    console.log('Updated product:', updatedProduct);

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// Add a controller to delete variant
export const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Remove variant from product's variants array
    await Product.findByIdAndUpdate(
      variant.product,
      { $pull: { variants: variantId } }
    );

    // Delete variant
    await Variant.findByIdAndDelete(variantId);

    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ message: 'Error deleting variant' });
  }
};

// Update product status (block/unblock)
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isListed } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isListed },
      { new: true }
    ).populate('category', 'name')
      .populate('brand', 'name');

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update variant
export const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updateData = req.body;
    let mainImageUrl = '';
    let subImageUrls = [];

    // Handle image updates if files are present
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) {
        mainImageUrl = req.files.mainImage[0].path || req.files.mainImage[0].secure_url;
        updateData.mainImage = mainImageUrl;
      }
      if (req.files.subImages) {
        subImageUrls = req.files.subImages.map(file => file.path || file.secure_url);
        updateData.subImages = subImageUrls;
      }
    }

    const updatedVariant = await Variant.findByIdAndUpdate(
      variantId,
      updateData,
      { new: true }
    ).populate('product', 'name');

    if (!updatedVariant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update product block status
export const updateProductBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).populate('category', 'name')
      .populate('brand', 'name');

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product block status:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update variant block status
export const updateVariantBlockStatus = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { isBlocked } = req.body;

    const updatedVariant = await Variant.findByIdAndUpdate(
      variantId,
      { isBlocked },
      { new: true }
    ).populate('product', 'name');

    if (!updatedVariant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json(updatedVariant);
  } catch (error) {
    console.error('Error updating variant block status:', error);
    res.status(400).json({ message: error.message });
  }
};