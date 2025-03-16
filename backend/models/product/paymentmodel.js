const mongoose = require('mongoose');

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
    signature: {
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

module.exports = mongoose.model('Payment', paymentSchema);