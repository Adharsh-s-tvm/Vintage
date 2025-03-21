import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Add this import
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { api } from '../../lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/Card';
import { Input } from '../../ui/Input';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { Separator } from '../../ui/Separator';
import { MapPin, CreditCard, Shield, RefreshCw, Truck, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/Dialog';

function AddressForm({ onAddressAdded, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api}/user/profile/address`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });

      if (response.data) {
        toast.success('Address added successfully');
        onAddressAdded(response.data);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full">Add Address</Button>
    </form>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Replace cart state with Redux selector
  const { cartItems, subtotal, shipping, total, loading } = useSelector((state) => state.cart);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    // Remove fetchCart since cart data is managed by Redux
    fetchAddresses();
  }, []);

  // Remove fetchCart function as it's handled in Cart.jsx

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${api}/user/profile/address`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      setAddresses(response.data);
      // Set default address if exists
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod) {
      toast.error('Please select delivery address and payment method');
      return;
    }

    try {
      if (selectedPaymentMethod === 'cod') {
        const orderResponse = await axios.post(`${api}/user/orders`, {
          addressId: selectedAddress,
          paymentMethod: selectedPaymentMethod
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
        });
        
        toast.success('Order placed successfully!');
        navigate(`/success/${orderResponse.data.orderId}`);
        return;
      }

      // For online payment
      const paymentResponse = await axios.post(`${api}/payments/create-order`, {
        amount: total,
        addressId: selectedAddress,
        paymentMethod: selectedPaymentMethod
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Failed to create payment order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentResponse.data.order.amount,
        currency: "INR",
        name: "Your Store Name",
        description: "Order Payment",
        order_id: paymentResponse.data.order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${api}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tempOrderId: paymentResponse.data.tempOrderId,
              amount: total,
              addressId: selectedAddress,
              paymentMethod: selectedPaymentMethod
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              navigate(`/success/${verifyResponse.data.orderId}`);
            } else {
              navigate(`/order-failed?amount=${total}&addressId=${selectedAddress}&paymentMethod=${selectedPaymentMethod}`);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
            navigate(`/order-failed?amount=${total}&addressId=${selectedAddress}&paymentMethod=${selectedPaymentMethod}`);
          }
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
            navigate(`/order-failed?amount=${total}&addressId=${selectedAddress}&paymentMethod=${selectedPaymentMethod}`);
          }
        },
        prefill: {
          name: addresses.find(addr => addr._id === selectedAddress)?.fullName,
          contact: addresses.find(addr => addr._id === selectedAddress)?.phone,
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed');
        navigate(`/order-failed?amount=${total}&addressId=${selectedAddress}&paymentMethod=${selectedPaymentMethod}`);
      });

    } catch (error) {
      console.error('Order/Payment Error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress._id);
  };

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  if (!cartItems?.length) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-4">Add items to your cart to checkout</p>
                <Button asChild>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Button variant="outline" asChild>
            <Link to="/products">
              <Truck className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Items and Addresses */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Items Section - Moved to top */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {cartItems.length} items in your cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.variant._id} className="flex space-x-4">
                      <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.variant.mainImage}
                          alt={item.variant.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.variant.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.variant.size}, Color: {item.variant.color}
                        </p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address Section - Moved below items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Select Delivery Address
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Delivery Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm
                      onAddressAdded={handleAddressAdded}
                      onClose={() => document.querySelector('[role="dialog"]').close()}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    <RadioGroup
                      value={selectedAddress}
                      onValueChange={setSelectedAddress}
                      className="space-y-4"
                    >
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`p-4 border rounded-lg ${selectedAddress === address._id ? 'border-primary' : 'border-gray-200'
                            }`}
                        >
                          <div className="flex items-start space-x-4">
                            <RadioGroupItem value={address._id} id={address._id} />
                            <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                              <div className="font-medium">{address.fullName}</div>
                              <div className="text-sm text-gray-500">
                                {address.street}, {address.city}, {address.state} {address.postalCode}
                              </div>
                              <div className="text-sm text-gray-500">
                                Phone: {address.phone}
                              </div>
                              {address.isDefault && (
                                <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Default Address
                                </span>
                              )}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">No delivery addresses found</p>
                    <Button onClick={() => navigate('/profile/addresses')}>
                      Add New Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Summary and Policies */}
          <div>
            {/* Payment Method Selection */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="text-sm">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="text-sm">Online/Net Banking</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="text-sm">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="text-sm">Wallet</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || !selectedPaymentMethod}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              </CardFooter>
            </Card>

            {/* Policies Section */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium">Payment Policy</h3>
                  <p className="text-sm text-gray-600">
                    Secure payment processing. We accept credit cards, debit cards, and UPI.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <RefreshCw className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium">Return Policy</h3>
                  <p className="text-sm text-gray-600">
                    Easy returns within 30 days of delivery. Return shipping is free for eligible items.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium">Shipping Policy</h3>
                  <p className="text-sm text-gray-600">
                    Free shipping on orders over $500. Standard delivery in 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Checkout;