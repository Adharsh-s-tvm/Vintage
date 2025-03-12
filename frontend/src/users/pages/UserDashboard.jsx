import React, { useState } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import {
  Package,
  Heart,
  CreditCard,
  MapPin,
  User,
  ChevronRight,
  Edit,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Separator } from '../../ui/Separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/Tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/Card';
import { toast } from '../../hooks/useToast';

// Mock user data
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  addresses: [
    {
      id: 1,
      name: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      default: true
    },
    {
      id: 2,
      name: 'Work',
      street: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      country: 'USA',
      default: false
    }
  ],
  payments: [
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiry: '04/25',
      default: true
    },
    {
      id: 2,
      type: 'Mastercard',
      last4: '5555',
      expiry: '07/24',
      default: false
    }
  ],
  recentOrders: [
    {
      id: 'ORD123456',
      date: '2023-07-15',
      status: 'Delivered',
      items: 2,
      total: 259.98
    },
    {
      id: 'ORD789101',
      date: '2023-08-22',
      status: 'Processing',
      items: 1,
      total: 89.99
    }
  ]
};

export default function UserDashboard() {
  const [userData, setUserData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserData(prev => ({
      ...prev,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone
    }));
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{userData.name}</CardTitle>
                    <CardDescription>{userData.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="p-0">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="w-full flex flex-col space-y-0 rounded-none p-0 bg-transparent">
                    <TabsTrigger
                      value="profile"
                      className="w-full justify-start px-6 py-3 rounded-none border-b font-normal data-[state=active]:font-medium data-[state=active]:bg-gray-50"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="w-full justify-start px-6 py-3 rounded-none border-b font-normal data-[state=active]:font-medium data-[state=active]:bg-gray-50"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Orders
                    </TabsTrigger>
                    <TabsTrigger
                      value="wishlist"
                      className="w-full justify-start px-6 py-3 rounded-none border-b font-normal data-[state=active]:font-medium data-[state=active]:bg-gray-50"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </TabsTrigger>
                    <TabsTrigger
                      value="addresses"
                      className="w-full justify-start px-6 py-3 rounded-none border-b font-normal data-[state=active]:font-medium data-[state=active]:bg-gray-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Addresses
                    </TabsTrigger>
                    <TabsTrigger
                      value="payments"
                      className="w-full justify-start px-6 py-3 rounded-none border-b font-normal data-[state=active]:font-medium data-[state=active]:bg-gray-50"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Methods
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>

              <Separator />

              <CardFooter className="p-6">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="profile">
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your account details</CardDescription>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleSaveProfile}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={editForm.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={editForm.email}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={editForm.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{userData.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{userData.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{userData.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => toast({
                        title: "Password reset email sent",
                        description: "Check your email for a link to reset your password"
                      })}
                    >
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>View and manage your orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData.recentOrders.length > 0 ? (
                      <div className="space-y-4">
                        {userData.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">
                                Placed on {new Date(order.date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className={`inline-block h-2 w-2 rounded-full mr-2 ${order.status === 'Delivered' ? 'bg-green-500' :
                                  order.status === 'Shipped' ? 'bg-blue-500' : 'bg-orange-500'
                                  }`} />
                                <span className="text-sm">{order.status}</span>
                              </div>
                            </div>
                            <div className="mt-2 md:mt-0 md:text-right">
                              <p className="font-medium">${order.total.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">{order.items} items</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 md:mt-0 w-full md:w-auto"
                              asChild
                            >
                              <Link to={`/ecommerce/orders#${order.id}`}>
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <Button asChild>
                          <Link to="/ecommerce">Start Shopping</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/ecommerce/orders">
                        View All Orders
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Wishlist</CardTitle>
                    <CardDescription>Products you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">You can view your saved items here.</p>
                      <Button asChild>
                        <Link to="/ecommerce/wishlist">
                          View Wishlist
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Addresses</CardTitle>
                        <CardDescription>Manage your shipping addresses</CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData.addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 ${address.default ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <h3 className="font-medium">{address.name}</h3>
                              {address.default && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zip}</p>
                            <p>{address.country}</p>
                          </div>
                          {!address.default && (
                            <Button variant="link" className="text-xs px-0 h-6 mt-2">
                              Set as default
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Manage your payment options</CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className={`border rounded-lg p-4 ${payment.default ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium">{payment.type} •••• {payment.last4}</h3>
                                {payment.default && (
                                  <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Expires {payment.expiry}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {!payment.default && (
                            <Button variant="link" className="text-xs px-0 h-6 mt-2">
                              Set as default
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
