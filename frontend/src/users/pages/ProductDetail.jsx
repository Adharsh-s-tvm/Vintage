import React, { useEffect, useState } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import {
  Heart,
  Share2,
  Star,
  StarHalf,
  Truck,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/useToast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/Tabs';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Separator } from '../../ui/Separator';
import axios from 'axios';
import { api } from '../../lib/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { ChevronDown } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToWishlist } from '../../redux/slices/wishlistSlice';

// Mock product data

// Mock related products
// const relatedProducts = [];

// Add these temporary rating stats (you can replace with real data later)
const dummyRatingStats = {
  average: 4.5,
  total: 127,
  distribution: {
    5: 89,
    4: 24,
    3: 8,
    2: 4,
    1: 2
  }
};

// Add these dummy reviews (replace with real data later)
const dummyReviews = [
  {
    id: 1,
    user: "John Doe",
    rating: 5,
    date: "2024-02-15",
    comment: "Great product! The quality is excellent and fits perfectly.",
    images: ["https://example.com/review1.jpg"]
  },
  {
    id: 2,
    user: "Jane Smith",
    rating: 4,
    date: "2024-02-10",
    comment: "Good product but slightly expensive.",
  }
];

// Add dummy coupons (replace with real data later)
const dummyCoupons = [
  {
    code: "FIRST20",
    discount: "20%",
    description: "20% off on your first purchase",
    minPurchase: 1000,
    expiryDate: "2024-03-31"
  },
  {
    code: "SUMMER10",
    discount: "₹100",
    description: "Flat ₹100 off on summer collection",
    minPurchase: 500,
    expiryDate: "2024-04-30"
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showRatingDetails, setShowRatingDetails] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${api}/products/${id}`);
        const productData = response.data.product;
        console.log("Single product: ", productData);

        if (productData.isBlocked) {
          toast({
            variant: "destructive",
            title: "Product Unavailable",
            description: "This product is currently not available.",
          });
          navigate('/products');
          return;
        }

        setProduct(productData);
        await fetchRelatedProducts(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        });
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Update selected variant when size changes
  useEffect(() => {
    if (product && selectedSize) {
      const variant = product.variants.find(v => v.size === selectedSize);
      setSelectedVariant(variant);
      if (variant) {
        // Reset selected image index when variant changes
        setSelectedImage(0);
      }
    }
  }, [selectedSize, product]);

  const getProductImages = (product, variant = null) => {
    if (!product || !product.variants || product.variants.length === 0) return [];

    // Use the selected variant if provided, otherwise use the first variant
    const targetVariant = variant || product.variants[0];
    const images = [];

    // Add main image
    if (targetVariant.mainImage) {
      images.push(targetVariant.mainImage);
    }

    // Add sub images
    if (targetVariant.subImages && targetVariant.subImages.length > 0) {
      images.push(...targetVariant.subImages);
    }

    return images;
  };

  const getAllImages = (product) => {
    if (!product) return [];
    const allImages = product.variants.reduce((images, variant) => {
      if (variant.mainImage) images.push(variant.mainImage);
      if (variant.subImages) images.push(...variant.subImages);
      return images;
    }, []);
    return [...new Set(allImages)]; // Remove duplicates
  };

  const getAvailableSizes = (product) => {
    if (!product) return [];
    return [...new Set(product.variants.map(variant => variant.size))];
  };

  // Add this function to handle mouse movement
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  // Add this helper function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Add this function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add this function to fetch related products
  const fetchRelatedProducts = async (product) => {
    try {
      // Fetch products with the same category or brand
      const response = await axios.get(`${api}/products`, {
        params: {
          category: product.category._id,
          brand: product.brand._id,
          exclude: product._id // Exclude current product
        }
      });

      setRelatedProducts(response.data.products.slice(0, 4)); // Limit to 4 related products
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div>Product not found</div>
        </div>
      </Layout>
    );
  }

  const productImages = selectedVariant
    ? getProductImages(product, selectedVariant)
    : getProductImages(product);
  const availableSizes = getAvailableSizes(product);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Error",
        description: "Please select a size",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
      return;
    }

    try {
      await axios.post(
        `${api}/user/cart/add`,
        {
          variantId: selectedVariant._id,
          quantity: quantity
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast({
        title: "Success",
        description: "Product added to cart",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to cart",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedVariant) {
      toast({
        title: "Error",
        description: "Please select a size",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
      return;
    }

    try {
      await axios.post(
        `${api}/user/wishlist`,
        {
          productId: product._id,
          variantId: selectedVariant._id
        },
        { withCredentials: true }
      );

      dispatch(addToWishlist({ ...product, selectedVariant }));
      toast({
        title: "Success",
        description: "Added to wishlist",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to wishlist",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div
              className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
            >
              {productImages.length > 0 && (
                <img
                  src={productImages[selectedImage]}
                  alt={`${product.name} - ${selectedVariant?.size || 'Default'}`}
                  className="h-full w-full object-cover object-center"
                />
              )}
              {isHovering && productImages.length > 0 && (
                <div
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{
                    background: `url(${productImages[selectedImage]}) no-repeat`,
                    backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    backgroundSize: '200%',
                    zIndex: 10
                  }}
                />
              )}
            </div>

            {/* Thumbnail images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, i) => (
                  <button
                    key={i}
                    className={`aspect-square rounded-md overflow-hidden bg-gray-100 
                      ${i === selectedImage ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${selectedVariant?.size || 'Default'} - View ${i + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link to="#" className="hover:text-primary">{product.category.name}</Link>
              <span>/</span>
              <span className="text-gray-700">{product.name}</span>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Brand:</span>
              <span className="text-sm font-medium">{product.brand.name}</span>
            </div>

            {/* Add this new ratings section */}
            <div className="mt-4">
              <button
                onClick={() => setShowRatingDetails(!showRatingDetails)}
                className="flex items-center space-x-2 hover:text-primary transition-colors"
              >
                <div className="flex items-center">
                  {renderStars(dummyRatingStats.average)}
                </div>
                <span className="text-sm font-medium">{dummyRatingStats.average}</span>
                <span className="text-sm text-gray-500">({dummyRatingStats.total} reviews)</span>
              </button>

              {showRatingDetails && (
                <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                  {Object.entries(dummyRatingStats.distribution)
                    .reverse()
                    .map(([rating, count]) => (
                      <div key={rating} className="flex items-center space-x-4">
                        <div className="w-12 text-sm">{rating} stars</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(count / dummyRatingStats.total) * 100}%`
                            }}
                          />
                        </div>
                        <div className="w-12 text-sm text-gray-500">{count}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Price section */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                ₹{selectedVariant ? selectedVariant.price.toFixed(2) : product?.variants[0]?.price.toFixed(2)}
              </span>

              {/* Stock status only shown when variant is selected */}
              {selectedVariant && (
                <div className="flex items-center">
                  {selectedVariant.stock > 0 ? (
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm font-medium text-green-600">
                        In Stock ({selectedVariant.stock} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm font-medium text-red-600">Out of Stock</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size selector */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Size</h3>
              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="mt-2 grid grid-cols-6 gap-2"
              >
                {getAvailableSizes(product).map((size) => (
                  <div key={size}>
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`size-${size}`}
                      className={`flex h-10 items-center justify-center rounded-md border text-sm font-medium 
                        ${selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                    >
                      {size}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Add to cart section */}
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!selectedSize || (selectedVariant && selectedVariant.stock === 0)}
              >
                {!selectedSize
                  ? "Select Size"
                  : selectedVariant && selectedVariant.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"
                }
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleAddToWishlist}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Additional product info */}
            <div className="mt-6 text-sm text-gray-500 space-y-3">
              <div className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-gray-400" />
                <span>Free shipping on orders over ₹500</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-gray-400" />
                <span>Free returns within 30 days</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-gray-400" />
                <span>2-year warranty included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Replace the existing Tabs section with this Accordion version */}
        <div className="mt-8 space-y-6">
          {/* Reviews Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="reviews">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium">Reviews & Ratings</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(dummyRatingStats.average)}</div>
                    <span className="text-sm text-gray-500">
                      ({dummyRatingStats.total} reviews)
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-4">
                  {/* Rating Summary */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl font-bold">{dummyRatingStats.average}</span>
                      <div className="space-y-1">
                        <div className="flex">{renderStars(dummyRatingStats.average)}</div>
                        <span className="text-sm text-gray-500">
                          Based on {dummyRatingStats.total} reviews
                        </span>
                      </div>
                    </div>
                    <Button size="sm">Write a Review</Button>
                  </div>

                  {/* Rating Distribution */}
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {Object.entries(dummyRatingStats.distribution)
                      .reverse()
                      .map(([rating, count]) => (
                        <div key={rating} className="flex items-center text-sm space-x-2">
                          <span className="w-12">{rating} stars</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${(count / dummyRatingStats.total) * 100}%`
                              }}
                            />
                          </div>
                          <span className="w-8 text-gray-500 text-xs">{count}</span>
                        </div>
                      ))}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dummyReviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                            {review.user.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{review.user}</h4>
                              <span className="text-xs text-gray-500">
                                {formatDate(review.date)}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                            {review.images && (
                              <div className="mt-2 flex gap-2">
                                {review.images.map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Review ${index + 1}`}
                                    className="h-16 w-16 object-cover rounded"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Coupons Accordion */}
            <AccordionItem value="coupons">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium">Available Coupons</h3>
                  <span className="text-sm text-gray-500">
                    ({dummyCoupons.length} offers available)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-3">
                  {dummyCoupons.map((coupon, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 flex items-center justify-between bg-gray-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{coupon.code}</span>
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                            {coupon.discount} OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{coupon.description}</p>
                        <div className="text-xs text-gray-500">
                          Min: ₹{coupon.minPurchase} | Expires: {formatDate(coupon.expiryDate)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.code);
                          toast({
                            title: "Coupon code copied!",
                            description: `${coupon.code} has been copied to clipboard`,
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Shipping Info Accordion */}
            <AccordionItem value="shipping">
              <AccordionTrigger className="hover:no-underline">
                <h3 className="text-lg font-medium">Shipping Information</h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Delivery Details</h4>
                    <p className="text-sm text-gray-600">
                      Free standard shipping on orders over ₹500. Estimated delivery time: 3-5 business days.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Return Policy</h4>
                    <p className="text-sm text-gray-600">
                      Easy returns within 30 days of delivery. Return shipping is free for eligible items.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* After the Accordion section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const lowestPrice = Math.min(...relatedProduct.variants.map(v => v.price));
                const mainImage = relatedProduct.variants[0]?.mainImage;

                return (
                  <div
                    key={relatedProduct._id}
                    className="group relative"
                    onClick={() => window.location.href = `/products/${relatedProduct._id}`}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={mainImage}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                      />
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{lowestPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <p>{relatedProduct.brand.name}</p>
                        <div className="flex items-center">
                          {renderStars(4.5)} {/* You can replace with actual rating */}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}