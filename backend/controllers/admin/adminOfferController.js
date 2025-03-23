import Offer from '../../models/product/offerModel.js';

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
    const { id } = req.params;
    const updateData = req.body;
    
    const offer = await Offer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
