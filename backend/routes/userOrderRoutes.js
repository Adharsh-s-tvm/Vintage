import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    returnOrder
} from '../controllers/userOrderController.js';

const router = express.Router();

// Protect all order routes
router.use(authenticate);

// Create new order
router.post('/', createOrder);

// Get all orders
router.get('/', getOrders);

// Get single order
router.get('/:id', getOrderById);

// Cancel order
router.put('/:id/cancel', cancelOrder);

// Return order
router.post('/:id/return', returnOrder);

export default router;
