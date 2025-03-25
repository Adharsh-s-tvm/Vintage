import Coupon from '../../models/product/couponModel.js';

export const getAvailableCoupons = async (req, res) => {
  
    console.log("function called coupon 1");
    

  try {
    console.log("function called coupon 2");
    
    const currentDate = new Date();
    const coupons = await Coupon.find({
      
      isExpired: false,
      usedBy: { $nin: [req.user._id] }
    });
    console.log( "coupons" , coupons);
    

    res.json(coupons );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { couponCode, cartTotal } = req.body;
    
    const coupon = await Coupon.findOne({ 
      couponCode,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isExpired: false,
      usedBy: { $nin: [req.user._id] }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    let discountAmount;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      discountAmount,
      couponDetails: coupon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};