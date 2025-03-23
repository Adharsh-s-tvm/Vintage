import Offer from '../../models/product/offerModel.js';

export const addOffer = async (req, res) => {
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
