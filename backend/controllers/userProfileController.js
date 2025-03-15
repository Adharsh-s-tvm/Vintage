import User from '../models/userModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// @desc    Get user details
// @route   GET /api/users/details
// @access  Private
export const getUserDetails = asyncHandler(async (req, res) => {
    console.log("details fn called", req.user);

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
            // image: user.image,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Error in getUserDetails:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
