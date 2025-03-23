import Coupon from '../../models/product/couponModel.js';

export const addCoupon = async (req, res) => {
  try {
    const { couponCode, discountType, discountValue, startDate, endDate, minOrderAmount } = req.body;

    // Validate required fields
    if (!couponCode || !discountType || !discountValue || !startDate || !endDate || !minOrderAmount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create new coupon
    const coupon = new Coupon({
      couponCode,
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

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
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
