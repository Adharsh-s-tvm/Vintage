import React, { useEffect, useState } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { Trash, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '../../hooks/useToast';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist, setWishlistItems } from '../../redux/slices/wishlistSlice';
import { setCartItems } from '../../redux/slices/cartSlice'; // Add this import
import axios from 'axios';
import { api } from '../../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/AlertDialog";

export default function Wishlist() {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${api}/user/wishlist`, {
        withCredentials: true
      });
      dispatch(setWishlistItems(response.data));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wishlist items",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    }
  };

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setIsDialogOpen(true);
  };

  const removeItem = async () => {

    if (!itemToRemove) return;
console.log(" itemToRem", itemToRemove.variant._id);

    try {
      const response = await axios.delete(`${api}/user/wishlist/${itemToRemove.variant._id}`, {
        withCredentials: true
      });
      
      // Check if the response is successful before updating the state
      if (response.data.success) {
        dispatch(removeFromWishlist(itemToRemove.variant._id));
        toast({
          title: "Success",
          description: "Item removed from wishlist",
          duration: 2000,
          className: "bg-white text-black border border-gray-200"
        });
      } else {
        throw new Error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item from wishlist",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    } finally {
      setIsDialogOpen(false);
      setItemToRemove(null);
    }
  };

  const moveToCart = async (item) => {
    try {
      const response = await axios.post(
        `${api}/user/cart/add`,
        {
          variantId: item.variant._id,
          quantity: 1,
          removeFromWishlist: true
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Update cart state with cart data
      if (response.data.cart) {
        dispatch(setCartItems(response.data.cart));
      }

      // Remove item from wishlist state
      dispatch(removeFromWishlist(item.variant._id));

      toast({
        title: "Success",
        description: "Item moved to cart",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to move item to cart",
        duration: 2000,
        className: "bg-white text-black border border-gray-200"
      });
    }
  };

  const renderWishlistItem = (item) => (
    <div
      key={item.variant._id}
      className="bg-white rounded-lg shadow-sm overflow-hidden flex"
    >
      <div className="relative h-32 w-32 flex-shrink-0">
        <img
          src={item.variant.mainImage}
          alt={item.product.name}
          className="h-full w-full object-cover"
        />
        {item.variant.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <Link
            to={`/products/${item.product._id}`}
            className="text-base font-medium text-gray-900 hover:text-primary"
          >
            {item.product.name}
          </Link>
          <div className="mt-1 text-sm text-gray-500">
            Size: {item.variant.size}, Color: {item.variant.color}
          </div>
          <div className="mt-1 text-base font-semibold">
            ₹{item.variant.price.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            asChild
          >
            <Link to={`/products/${item.product._id}`}>
              View Details
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={item.variant.stock === 0}
            onClick={() => moveToCart(item)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Move to Cart
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-gray-500 hover:text-red-500 h-8 w-8"
            onClick={() => handleRemoveClick(item)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>

        {/* Confirmation Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">Remove from Wishlist</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to remove this item from your wishlist?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex space-x-2">
              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={removeItem} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {wishlistItems.length > 0 ? (
          <div className="space-y-4">
            {wishlistItems.map((item) => renderWishlistItem(item))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-xl font-medium mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-4">
              Items added to your wishlist will appear here.
            </p>
            <Button asChild>
              <Link to="/products">Discover Products</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
