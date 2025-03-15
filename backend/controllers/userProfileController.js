import User from '../models/userModel.js';
import Address from '../models/userAddressModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get user details
// @route   GET /api/user/profile/details
// @access  Private
export const getUserDetails = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            phone: user.phone,
            image: user.image,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Error in getUserDetails:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get user addresses
// @route   GET /api/user/profile/address
// @access  Private
export const getUserAddresses = asyncHandler(async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
});

// @desc    Add new address
// @route   POST /api/user/profile/address
// @access  Private
export const addUserAddress = asyncHandler(async (req, res) => {
    try {
        const {
            fullName,
            phone,
            street,
            city,
            state,
            country,
            postalCode,
            isDefault
        } = req.body;

        // If this address is set as default, unset any existing default address
        if (isDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { $set: { isDefault: false } }
            );
        }

        const newAddress = await Address.create({
            user: req.user._id,
            fullName,
            phone,
            street,
            city,
            state,
            country,
            postalCode,
            isDefault
        });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Failed to add address' });
    }
});

// @desc    Update address
// @route   PUT /api/user/profile/address/:id
// @access  Private
export const updateUserAddress = asyncHandler(async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (req.body.isDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { $set: { isDefault: false } }
            );
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Failed to update address' });
    }
});

// @desc    Delete address
// @route   DELETE /api/user/profile/address/:id
// @access  Private
export const deleteUserAddress = asyncHandler(async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json({ message: 'Address removed successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Failed to delete address' });
    }
});

// @desc    Update user details
// @route   PUT /api/user/profile/details
// @access  Private
export const updateUserDetails = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only the fields that are provided
        const {
            firstname,
            lastname,
            email,
            username,
            phone,
            image
        } = req.body;

        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (email) user.email = email;
        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (image) user.image = image;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            username: updatedUser.username,
            phone: updatedUser.phone,
            image: updatedUser.image,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Failed to update user details' });
    }
});
