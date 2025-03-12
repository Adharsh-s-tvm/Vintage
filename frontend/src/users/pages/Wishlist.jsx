import React, { useState } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { Trash, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '../../hooks/useToast';

// Mock wishlist data
const wishlistItems = [
  {
    id: 1,
    name: 'Winter Puffer Jacket',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1036&q=80',
    inStock: true
  },
  {
    id: 4,
    name: 'Waterproof Rain Jacket',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1620330389433-b9bb261344ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    inStock: true
  },
  {
    id: 5,
    name: 'Fleece-Lined Jacket',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1613473060226-dd81153a63db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    inStock: false
  }
];

export default function Wishlist() {
  const [items, setItems] = useState(wishlistItems);

  const removeItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item has been removed from your wishlist",
    });
  };

  const moveToCart = (id) => {
    // In a real app, this would add to cart and then remove from wishlist
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    });
    removeItem(id);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover-lift"
              >
                <div className="relative aspect-square">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Link
                    to={`/ecommerce/product/${item.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-1 text-lg font-semibold">${item.price.toFixed(2)}</div>

                  <div className="mt-4 flex space-x-2">
                    <Button
                      className="flex-1"
                      disabled={!item.inStock}
                      onClick={() => moveToCart(item.id)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Move to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-medium mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Items added to your wishlist will appear here.
            </p>
            <Button asChild>
              <Link to="/ecommerce">Discover Products</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
