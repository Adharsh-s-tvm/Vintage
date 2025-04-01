import React from 'react';
import { Layout } from '../layout/Layout';
import { Button } from '../../ui/Button';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { retryPaymentResponseApi, verifyFailedPaymentAPi } from '../../services/api/userApis/userOrderApi';

export default function OrderFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');
  const addressId = searchParams.get('addressId');
  const paymentMethod = searchParams.get('paymentMethod');

  const handleRetryPayment = async () => {
    try {
      if (!amount || !addressId || !paymentMethod) {
        toast.error('Missing required payment information');
        navigate('/checkout');
        return;
      }

      // Create new Razorpay order with all required fields
      const paymentResponse = await retryPaymentResponseApi( {
        amount: parseFloat(amount),
        addressId: addressId,
        paymentMethod: paymentMethod
      },
      );

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Failed to create payment order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentResponse.data.order.amount,
        currency: "INR",
        name: "Vintage Jacket Store",
        description: "Order Payment",
        order_id: paymentResponse.data.order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await verifyFailedPaymentAPi( {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tempOrderId: paymentResponse.data.tempOrderId,
              amount: parseFloat(amount),
              addressId: addressId,
              paymentMethod: paymentMethod
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              navigate(`/success/${verifyResponse.data.orderId}`);
            } else {
              toast.error('Payment failed');
              navigate(`/order-failed?amount=${amount}&addressId=${addressId}&paymentMethod=${paymentMethod}`);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
            navigate(`/order-failed?amount=${amount}&addressId=${addressId}&paymentMethod=${paymentMethod}`);
          }
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
            navigate(`/order-failed?amount=${amount}&addressId=${addressId}&paymentMethod=${paymentMethod}`);
          }
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed');
        navigate(`/order-failed?amount=${amount}&addressId=${addressId}&paymentMethod=${paymentMethod}`);
      });

    } catch (error) {
      console.error('Retry payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to retry payment');
      navigate('/checkout');
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
            Payment Failed
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            We couldn't process your payment. Please try again.
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