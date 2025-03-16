import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} from '../controllers/userWishlistController.js';

const router = express.Router();

router.route('/')
    .get(authenticate, getWishlist)
    .post(authenticate, addToWishlist);

router.delete('/:productId', authenticate, removeFromWishlist);

export default router;
