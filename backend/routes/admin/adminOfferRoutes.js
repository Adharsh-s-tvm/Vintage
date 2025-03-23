import express from 'express';
import { addOffer, getAllOffers, updateOffer, toggleOfferStatus } from '../../controllers/admin/adminOfferController.js';
import asyncHandler from '../../middlewares/asyncHandler.js';

const router = express.Router();

router.post('/', asyncHandler(addOffer));
router.get('/', asyncHandler(getAllOffers));
router.put('/:id', asyncHandler(updateOffer));
router.patch('/:id/toggle-status', asyncHandler(toggleOfferStatus));

export default router;