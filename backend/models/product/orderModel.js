import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                sizeVariant: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Variant",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                finalPrice: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                status: {
                    type: String,
                    default: "pending",
                    enum: ["pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
                },          
                cancellationReason: {
                    type: String,
                },
                returnRequested: {
                    type: Boolean,
                    default: false,
                },
                returnReason: {
                    type: String,
                    enum: [
                        "Defective",
                        "Not as described",
                        "Wrong size/fit",
                        "Changed my mind",
                        "Other"
                    ],
                },
                additionalDetails: {
                    type: String,
                },
                returnStatus: {
                    type: String,
                    default: "Return Pending",
                    enum: ["Return Pending", "Return Approved", "Return Rejected"],
                },
                rejectionReason: {
                    type: String,
                },
            },
        ],
        shipping: {
            address: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
                required: true,
            },
            shippingMethod: {
                type: String,
                required: true,
                enum: ["Standard", "Express"],
            },
            deliveryCharge: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        payment: {
            method: {
                type: String,
                required: true,
                enum: ["cod", "online", "wallet"]
            },
            status: {
                type: String,
                required: true,
                enum: ["pending", "completed", "failed", "cancelled", "retry_pending"],
                default: "pending"
            },
            transactionId: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            paymentDate: {
                type: Date,
                default: Date.now,
            },
        },
        orderStatus: {
            type: String,
            required: true,
            default: "pending",
            enum: ["pending", "Processing", "Shiped", "Delivered", "Cancelled"],
        },
        reason: {
            type: String,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        couponCode: {
            type: String,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;