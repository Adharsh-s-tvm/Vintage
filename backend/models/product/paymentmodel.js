import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['created', 'completed', 'failed', 'cancelled', 'retry_pending'],
        default: 'created'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    checkoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checkout',
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;