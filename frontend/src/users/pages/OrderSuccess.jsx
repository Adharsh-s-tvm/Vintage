import React, { useEffect } from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { 
  ShoppingBag, 
  ClipboardList, 
  CheckCircle, 
  Package, 
  Bell, 
  Truck, 
  Calendar, 
  MapPin 
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { orderId } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-3xl w-full text-center py-12">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-25"></div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-green-100"></div>
              <CheckCircle className="relative mx-auto h-28 w-28 text-green-500" />
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-green-600 mb-4">
                Order Placed Successfully!
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="px-4 py-2 bg-green-100 rounded-lg text-green-700 font-medium">
                  Order #{orderId}
                </span>
                <span className="px-4 py-2 bg-blue-100 rounded-lg text-blue-700 font-medium">
                  Expected by {estimatedDelivery.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 hover:bg-white transition-colors rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-800">Order Date</p>
                  <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-center p-4 hover:bg-white transition-colors rounded-lg">
                  <MapPin className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-800">Shipping To</p>
                  <p className="text-sm text-gray-600">Default Address</p>
                </div>
                <div className="text-center p-4 hover:bg-white transition-colors rounded-lg">
                  <Truck className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-800">Shipping Method</p>
                  <p className="text-sm text-gray-600">Standard Delivery</p>
                </div>
                <div className="text-center p-4 hover:bg-white transition-colors rounded-lg">
                  <Package className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-800">Status</p>
                  <p className="text-sm text-gray-600">Processing</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 
                          shadow-lg hover:shadow-green-200"
              >
                <Link to="/orders">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Track Order
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 
                          transition-all duration-200"
              >
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Order Progress */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-green-700 mb-6">
                Order Progress
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-md">
                  <Bell className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Confirmation Sent</h3>
                    <p className="text-sm text-gray-600">
                      Check your email for order confirmation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-md">
                  <Package className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Order Processing</h3>
                    <p className="text-sm text-gray-600">
                      We're preparing your items for shipment
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-md">
                  <Truck className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Delivery Updates</h3>
                    <p className="text-sm text-gray-600">
                      Track your package in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}