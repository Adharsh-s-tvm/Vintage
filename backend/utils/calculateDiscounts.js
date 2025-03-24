import Offer from '../models/product/offerModel.js';
import Product from '../models/product/productModel.js';
import Variant from '../models/product/sizeVariantModel.js';

export const calculateAndUpdateDiscounts = async () => {
  try {
    // Get all active offers
    const activeOffers = await Offer.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    // Reset all discount prices first
    await Variant.updateMany({}, { $set: { discountPrice: null } });

    // Process each active offer
    for (const offer of activeOffers) {
      if (offer.offerType === "product") {
        // Handle product-specific offers
        for (const productId of offer.items) {
          const variants = await Variant.find({ product: productId });
          for (const variant of variants) {
            const discountAmount = (variant.price * offer.discountPercentage) / 100;
            const discountedPrice = Math.round(variant.price - discountAmount);
            await Variant.findByIdAndUpdate(
              variant._id,
              { discountPrice: discountedPrice }
            );
          }
        }
      } else if (offer.offerType === "category") {
        // Handle category-wide offers
        for (const categoryId of offer.items) {
          const products = await Product.find({ category: categoryId });
          for (const product of products) {
            const variants = await Variant.find({ product: product._id });
            for (const variant of variants) {
              const discountAmount = (variant.price * offer.discountPercentage) / 100;
              const discountedPrice = Math.round(variant.price - discountAmount);
              await Variant.findByIdAndUpdate(
                variant._id,
                { discountPrice: discountedPrice }
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error calculating discounts:', error);
    throw error;
  }
}; 