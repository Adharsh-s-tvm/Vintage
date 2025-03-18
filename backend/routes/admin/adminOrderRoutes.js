import express from 'express';
import { getAllOrders, updateOrderStatus } from '../../controllers/admin/adminOrderController.js';
// import { verifyAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',  getAllOrders);
router.patch('/:orderId/status',  updateOrderStatus);

export default router;