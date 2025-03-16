import React, { useState, useEffect } from 'react';
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
import { api } from '../../lib/api';
import axios from 'axios';
import { toast } from '../../hooks/useToast';

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${api}/user/cart`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        const items = response.data.items || [];
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 10; // Free shipping over ₹500
        const total = subtotal + shipping;

        setCart({
          items,
          subtotal,
          shipping,
          total
        });
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId, quantity) => {
    if (quantity < 1) return;

    try {
      const response = await axios.put(
        `${api}/user/cart/update`,
        { variantId, quantity },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        const items = response.data.items || [];
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 10;
        const total = subtotal + shipping;

        setCart({
          items,
          subtotal,
          shipping,
          total
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (variantId) => {
    try {
      const response = await axios.delete(
        `${api}/user/cart/remove/${variantId}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        const items = response.data.items || [];
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 10;
        const total = subtotal + shipping;

        setCart({
          items,
          subtotal,
          shipping,
          total
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cart?.items?.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    {cart.items.map((item) => (
                      <TableRow key={item.variant._id}>
                        <TableCell>
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
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
                        <TableCell>${item.price.toFixed(2)}</TableCell>
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
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => removeItem(item.variant._id)}
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
                <Button variant="outline">Update Cart</Button>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${cart.shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6">Proceed to Checkout</Button>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">We Accept</h3>
                  <div className="flex space-x-2">
                    <div className="h-8 w-12 bg-gray-100 rounded"></div>
                    <div className="h-8 w-12 bg-gray-100 rounded"></div>
                    <div className="h-8 w-12 bg-gray-100 rounded"></div>
                    <div className="h-8 w-12 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild>
              <Link to="/ecommerce">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
