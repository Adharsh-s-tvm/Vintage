import Offer from '../../models/product/offerModel.js';
import Variant from '../../models/product/sizeVariantModel.js';
import Product from '../../models/product/productModel.js';
import { calculateAndUpdateDiscounts } from '../../utils/calculateDiscounts.js';

const updateVariantPrices = async (offer) => {
  try {
    const { items, offerType, discountPercentage, isActive, startDate, endDate } = offer;
    
    // Check if offer is active and current date is within offer period
    const currentDate = new Date();
    const isValidPeriod = currentDate >= new Date(startDate) && currentDate <= new Date(endDate);
    
    if (!isActive || !isValidPeriod) {
      // Reset discount prices if offer is inactive or expired
      if (offerType === "product") {
        for (const productId of items) {
          await Variant.updateMany(
            { product: productId },
            { $unset: { discountPrice: "" } }
          );
        }
      } else if (offerType === "category") {
        for (const categoryId of items) {
          const products = await Product.find({ category: categoryId });
          for (const product of products) {
            await Variant.updateMany(
              { product: product._id },
              { $unset: { discountPrice: "" } }
            );
          }
        }
      }
      return;
    }

    // Update prices for active and valid offers
    if (offerType === "product") {
      for (const productId of items) {
        const variants = await Variant.find({ product: productId });
        for (const variant of variants) {
          const discountedPrice = Math.round(variant.price - (variant.price * discountPercentage / 100));
          variant.discountPrice = discountedPrice;
          await variant.save();
        }
      }
    } else if (offerType === "category") {
      for (const categoryId of items) {
        const products = await Product.find({ category: categoryId });
        for (const product of products) {
          const variants = await Variant.find({ product: product._id });
          for (const variant of variants) {
            const discountedPrice = Math.round(variant.price - (variant.price * discountPercentage / 100));
            variant.discountPrice = discountedPrice;
            await variant.save();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating variant prices:', error);
    throw error;
  }
};

export const addOffer = async (req, res) => {
    console.log("offer fn called");
    
  try {
    const { offerName, offerType, discountPercentage, startDate, endDate, items } = req.body;

    // Validate required fields
    if (!offerName || !offerType || !discountPercentage || !startDate || !endDate || !items.length) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new offer
    const offer = new Offer({
      offerName,
      offerType,
      discountPercentage,
      startDate,
      endDate,
      items
    });

    await offer.save();
    await updateVariantPrices(offer);

    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('items', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Recalculate all discounts
    await calculateAndUpdateDiscounts();
    
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    offer.isActive = !offer.isActive;
    await offer.save();
    
    // Recalculate all discounts
    await calculateAndUpdateDiscounts();
    
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
