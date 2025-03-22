import React from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { XCircle, RefreshCw, ClipboardList } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate(`/checkout?retry=${orderId}`);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <XCircle className="mx-auto h-24 w-24 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Payment Failed
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            We couldn't process your payment for order #{orderId}. Please try again.
          </p>

          <div className="space-y-4 md:space-y-0 md:flex md:gap-4 justify-center">
            <Button
              onClick={handleRetryPayment}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Retry Payment
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full md:w-auto"
            >
              <Link to={`/order-details/${orderId}`}>
                <ClipboardList className="mr-2 h-5 w-5" />
                View Order Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 