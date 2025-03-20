import express from 'express';
import { 
  getAllOrders, 
  updateOrderStatus, 
  updateReturnStatus,
  getReturnRequests 
} from '../../controllers/admin/adminOrderController.js';

const router = express.Router();

router.get('/', getAllOrders);
router.get('/returns', getReturnRequests);
router.patch('/:orderId/status', updateOrderStatus);
router.patch('/:orderId/return/:itemId', updateReturnStatus);

export default router;