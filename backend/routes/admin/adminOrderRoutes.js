import express from 'express';
import { getAllOrders, updateOrderStatus, updateReturnStatus } from '../../controllers/admin/adminOrderController.js';
// import { verifyAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',  getAllOrders);
router.patch('/:orderId/status',  updateOrderStatus);
router.patch('/:orderId/return', updateReturnStatus);

export default router;