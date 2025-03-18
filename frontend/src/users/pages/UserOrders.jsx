import React, { useState } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { ArrowRight, Download, Package, Truck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/Dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/Tabs';

// Mock orders data
const orders = [
  {
    id: 'ORD123456',
    date: '2023-07-15',
    status: 'Delivered',
    total: 259.98,
    items: [
      {
        id: 1,
        name: 'Winter Puffer Jacket',
        price: 129.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1036&q=80',
      },
      {
        id: 2,
        name: 'Leather Biker Jacket',
        price: 199.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    trackingNumber: 'TRK987654321'
  },
  {
    id: 'ORD789101',
    date: '2023-08-22',
    status: 'Processing',
    total: 89.99,
    items: [
      {
        id: 3,
        name: 'Denim Jacket with Patches',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    trackingNumber: null
  },
  {
    id: 'ORD111213',
    date: '2023-09-05',
    status: 'Shipped',
    total: 99.99,
    items: [
      {
        id: 4,
        name: 'Waterproof Rain Jacket',
        price: 99.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1620330389433-b9bb261344ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    trackingNumber: 'TRK555666777'
  }
];

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'Delivered':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="border-b border-gray-100 p-4 md:p-6">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <div className="text-sm text-gray-500">Order #{order.id}</div>
                      <div className="text-sm">Placed on {new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-between items-center">
                    <div className="font-medium text-lg">
                      Total: ${order.total.toFixed(2)}
                    </div>
                    <div className="flex space-x-3 mt-4 sm:mt-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                          >
                            Order Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Order #{order.id}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-6">
                            <Tabs defaultValue="items">
                              <TabsList className="w-full">
                                <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
                                <TabsTrigger value="shipping" className="flex-1">Shipping</TabsTrigger>
                                <TabsTrigger value="tracking" className="flex-1">Tracking</TabsTrigger>
                              </TabsList>
                              <TabsContent value="items">
                                <div className="space-y-4 mt-4">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex space-x-4 border-b pb-4">
                                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">
                                          Qty: {item.quantity}
                                        </div>
                                      </div>
                                      <div className="font-medium">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex justify-between pt-2">
                                    <span className="font-bold">Total:</span>
                                    <span className="font-bold">${order.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="shipping">
                                <div className="mt-4">
                                  <h3 className="font-medium mb-2">Shipping Address</h3>
                                  <div className="text-sm space-y-1">
                                    <p>{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>
                                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="tracking">
                                <div className="mt-4">
                                  {order.trackingNumber ? (
                                    <>
                                      <h3 className="font-medium mb-2">Tracking Number</h3>
                                      <p className="text-sm">{order.trackingNumber}</p>
                                      <div className="mt-4 flex justify-between">
                                        <div className="flex items-center space-x-1 text-sm">
                                          <span>Status:</span>
                                          <div className="flex items-center">
                                            {getStatusIcon(order.status)}
                                            <span className="ml-1">{order.status}</span>
                                          </div>
                                        </div>
                                        <Button variant="link" size="sm" className="text-sm">
                                          Track Package
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-sm">
                                      Tracking information will be available once your order ships.
                                    </p>
                                  )}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                          <div className="flex justify-between mt-6">
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </Button>

                            <Button size="sm">
                              Buy Again
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="default"
                        size="sm"
                        asChild
                      >
                        <Link to="#">
                          <span>Track Order</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-medium mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              When you place an order, it will appear here for you to track.
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
