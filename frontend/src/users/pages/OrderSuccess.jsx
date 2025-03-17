import React from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { ShoppingBag, ClipboardList, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 animate-bounce">
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
          </div>

          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-xl text-gray-600 mb-4">
            Thank you for your purchase. Your order #{orderId} has been confirmed.
          </p>

          <p className="text-gray-500 mb-8">
            You will receive an email confirmation shortly with your order details.
          </p>

          <div className="space-y-4 md:space-y-0 md:flex md:gap-4 justify-center">
            <Button
              asChild
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            >
              <Link to="/orders">
                <ClipboardList className="mr-2 h-5 w-5" />
                View Orders
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full md:w-auto border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          <div className="mt-12 p-6 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              What's Next?
            </h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• You'll receive an order confirmation email</li>
              <li>• We'll notify you when your order ships</li>
              <li>• Track your order in the Orders section</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}