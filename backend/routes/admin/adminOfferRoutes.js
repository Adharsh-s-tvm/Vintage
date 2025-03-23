import express from 'express';
import { addOffer, getAllOffers } from '../../controllers/admin/adminOfferController.js';
import asyncHandler from '../../middlewares/asyncHandler.js';

const router = express.Router();

router.post('/', asyncHandler(addOffer));
router.get('/', asyncHandler(getAllOffers));

export default router;