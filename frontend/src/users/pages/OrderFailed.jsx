import React from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { api } from '../../lib/api';

export default function OrderFailed() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const tempOrderId = searchParams.get('tempOrderId');
  const amount = searchParams.get('amount');

  const handleRetryPayment = async () => {
    try {
      // Create new Razorpay order
      const paymentResponse = await axios.post(`${api}/payments/create-order`, {
        amount: parseFloat(amount),
        tempOrderId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });

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
              amount: amount
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              navigate(`/success/${verifyResponse.data.orderId}`);
            } else {
              toast.error('Payment failed');
              navigate(`/order-failed?tempOrderId=${paymentResponse.data.tempOrderId}&amount=${amount}`);
            }
          } catch (error) {
            toast.error('Payment verification failed');
            navigate(`/order-failed?tempOrderId=${paymentResponse.data.tempOrderId}&amount=${amount}`);
          }
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
            navigate(`/order-failed?tempOrderId=${paymentResponse.data.tempOrderId}&amount=${amount}`);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed');
        navigate(`/order-failed?tempOrderId=${paymentResponse.data.tempOrderId}&amount=${amount}`);
      });

    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <XCircle className="mx-auto h-24 w-24 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Order Failed
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            We couldn't process your order. Please try again.
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
              onClick={() => navigate('/checkout')}
              variant="outline"
              className="w-full md:w-auto"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Return to Checkout
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 