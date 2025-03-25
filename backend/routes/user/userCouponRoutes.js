import express from 'express';
import { getAvailableCoupons, applyCoupon } from '../../controllers/user/userCouponController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/available', getAvailableCoupons);
router.post('/apply', applyCoupon);

export default router;