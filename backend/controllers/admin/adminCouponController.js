import Coupon from '../../models/product/couponModel.js';

export const addCoupon = async (req, res) => {
  try {
    const { couponCode, discountType, discountValue, startDate, endDate, minOrderAmount } = req.body;

    // Validate required fields and check for empty spaces
    if (!couponCode?.trim() || !discountType || !discountValue || !startDate || !endDate || !minOrderAmount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if(discountType === 'percentage' && discountValue > 100){
      return res.status(400).json({ message: 'Discount value must be less than 100 for percentage discount' });
    }

    // Validate coupon code format
    if (couponCode.trim().length < 3) {
      return res.status(400).json({ message: 'Coupon code must be at least 3 characters long' });
    }

    if (discountValue >= minOrderAmount) {
      return res.status(400).json({ message: 'Discount value must be less than minimum order amount' });
    }

    // Check if coupon code already exists (case insensitive)
    const existingCoupon = await Coupon.findOne({ 
      couponCode: { $regex: new RegExp(`^${couponCode.trim()}$`, 'i') }
    });
    
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create new coupon with trimmed code
    const coupon = new Coupon({
      couponCode: couponCode.trim().toUpperCase(),
      discountType,
      discountValue,
      startDate,
      endDate,
      minOrderAmount
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate coupon code if it's being updated
    if (updateData.couponCode) {
      if (!updateData.couponCode.trim()) {
        return res.status(400).json({ message: 'Coupon code cannot be empty' });
      }

      if (updateData.couponCode.trim().length < 3) {
        return res.status(400).json({ message: 'Coupon code must be at least 3 characters long' });
      }

      // Check if the new code already exists (excluding current coupon)
      const existingCoupon = await Coupon.findOne({
        couponCode: { $regex: new RegExp(`^${updateData.couponCode.trim()}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }

      // Trim and uppercase the coupon code
      updateData.couponCode = updateData.couponCode.trim().toUpperCase();
    }

    // Validate discount value if both discount value and min order amount are present
    if (updateData.discountValue && updateData.minOrderAmount) {
      if (updateData.discountValue >= updateData.minOrderAmount) {
        return res.status(400).json({ message: 'Discount value must be less than minimum order amount' });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isExpired = !coupon.isExpired;
    await coupon.save();

    res.status(200).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
