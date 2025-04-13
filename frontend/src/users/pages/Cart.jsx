import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCartItems, setLoading, setError } from '../../redux/slices/cartSlice';
import { Layout } from '../layout/Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Trash, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '../../hooks/useToast';
import { confirmRemoveApi, fetchCartApi, updateQuantityApi } from '../../services/api/userApis/cartApi';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Remove Item</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ cartItems, subtotal, shipping, total }) => {
  const originalSubtotal = cartItems.reduce((sum, item) =>
    sum + (item.variant.price * item.quantity), 0
  );

  const totalSavings = originalSubtotal - subtotal;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 animate-scaleUp hover:shadow-md transition-shadow duration-200">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Original Subtotal</span>
          <span className={totalSavings > 0 ? "line-through text-gray-500" : ""}>
            ₹{originalSubtotal.toFixed(2)}
          </span>
        </div>
        {totalSavings > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <span>Savings</span>
              <span>-₹{totalSavings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Subtotal after discount</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default function Cart() {
  const dispatch = useDispatch();
  const { cartItems, subtotal, shipping, total, loading } = useSelector((state) => state.cart);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null });

  useEffect(() => {
    fetchCart();
  }, [dispatch]);

  const fetchCart = async () => {
    dispatch(setLoading(true));
    try {
      // Simulate loading for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetchCartApi();
      dispatch(setCartItems(response.data));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch cart'));
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch cart',
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const MAX_QUANTITY_PER_ITEM = 5; // Add this constant at the top of the component

  const updateQuantity = async (variantId, quantity) => {
    if (quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      toast({
        title: "Error",
        description: `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}`,
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
      return;
    }

    try {
      const response = await updateQuantityApi(variantId, quantity);

      if (response.data) {
        dispatch(setCartItems(response.data));
        toast({
          title: "Success",
          description: "Cart updated",
          duration: 2000,
          className: "bg-white text-black border border-gray-200"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quantity",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    }
  };

  const confirmRemove = async () => {
    if (deleteModal.itemId) {
      try {
        const response = await confirmRemoveApi(deleteModal.itemId);

        if (response.data) {
          dispatch(setCartItems(response.data));
          toast({
            title: "Success",
            description: "Item removed from cart",
            duration: 2000,
            className: "bg-white text-black border border-gray-200"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to remove item",
          duration: 2000,
          className: "bg-white text-black border border-gray-200"
        });
      } finally {
        setDeleteModal({ isOpen: false, itemId: null });
      }
    }
  };

  const handleRemoveClick = (variantId) => {
    setDeleteModal({ isOpen: true, itemId: variantId });
  };

  // Remove the duplicate confirmRemove function and update the DeleteConfirmationModal usage
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : cartItems?.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 animate-slideUp">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 animate-scaleUp">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.variant._id}>
                        <TableCell>
                          <div className="flex items-center space-x-4">
                            <div className="h-24 md:h-16 w-24 md:w-16 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={item.variant.mainImage}
                                alt={item.variant.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                to={`/products/${item.variant.product._id}`}
                                className="font-medium text-gray-900 hover:text-primary"
                              >
                                {item.variant.product.name}
                              </Link>
                              <div className="text-sm text-gray-500 space-x-2">
                                <span>Size: {item.variant.size}</span>
                                <span>Color: {item.variant.color}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.variant._id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.variant._id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{((item.variant.discountPrice && item.variant.discountPrice > 0 && item.variant.discountPrice < item.variant.price
                            ? item.variant.discountPrice
                            : item.variant.price) * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => handleRemoveClick(item.variant._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <Button variant="outline" asChild>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>

            <div className="md:col-span-1">
              <CartSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />

              <Button className="w-full mt-6" asChild>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="mt-6">
                <div className="flex space-x-2">

                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center animate-scaleUp">
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
        onConfirm={confirmRemove}
      />
    </Layout>
  );
}
