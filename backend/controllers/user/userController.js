import User from "../../models/userModel.js";
import Otp from "../../models/signUpOtpModel.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../../utils/createToken.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { oauth2client } from "../../utils/googleConfig.js";
import crypto from 'crypto';


dotenv.config()



const createUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    console.log(firstname, lastname, email, password)

    if (!firstname || !lastname || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the inputs.");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Generate a unique username
    const baseUsername = `${firstname.toLowerCase()}_${lastname.toLowerCase()}`;
    let username = baseUsername;
    let counter = 1;

    // Check if username exists and generate a unique one if needed
    while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        firstname,
        lastname,
        username, // Add the generated username
        email,
        password: hashedPassword
    });

    try {
        await newUser.save();
        createToken(res, newUser._id);

        res.status(201).json({
            _id: newUser._id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        res.status(401);
        throw new Error("User not registered");
    }

    if (existingUser.status == 'banned') {
        res.status(403);
        throw new Error("Your account has been blocked. Contact support for assistance.");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
    );

    if (!isPasswordValid) {
        res.status(401);
        throw new Error("Invalid password");
    }

    const token = createToken(res, existingUser._id);

    res.status(200).json({
        success: true,
        _id: existingUser._id,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        token // Include token in response
    });
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
        httyOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
});



const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
        });
    } else {
        res.status(404);
        throw new Error("User not found.");
    }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user.password = hashedPassword;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});


const googleLogin = asyncHandler(async (req, res) => {
    const { code } = req.body;

    try {
        // Get tokens from Google
        const { tokens } = await oauth2client.getToken(code);

        // Get user info using access token
        const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            }
        );

        const { email, given_name: firstname, family_name: lastname } = userInfo.data;

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            // Generate username from email
            let username = email.split('@')[0];
            let counter = 1;

            // Ensure username is unique
            while (await User.findOne({ username })) {
                username = `${email.split('@')[0]}${counter}`;
                counter++;
            }

            // Create new user
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                firstname,
                lastname,
                email,
                username,
                password: hashedPassword,
                authProvider: 'google'
            });
        }

        // Create JWT token
        const token = createToken(res, user._id);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            token
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({
            message: "Failed to authenticate with Google",
            error: error.message
        });
    }
});

const checkEmail = asyncHandler(async (req, res) => {
    console.log('called');

    const { email } = req.body;
    const user = await User.findOne({ email });

    res.json({ exists: !!user });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
});

export const sendEmailChangeOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user._id;

        // Check if email already exists for another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use by another account' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in database with expiry (10 minutes)
        await User.findByIdAndUpdate(userId, {
            emailChangeOtp: otp,
            emailChangeOtpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
            newEmail: email
        });

        // Send OTP to the new email address
        // Implement your email sending logic here
        // For example:
        // await sendEmail({
        //     to: email,
        //     subject: 'Email Change Verification',
        //     text: `Your OTP for email change is: ${otp}. It will expire in 10 minutes.`
        // });

        // For development, you can console log the OTP
        console.log(`OTP for email change: ${otp}`);

        res.status(200).json({ message: 'OTP sent to your new email address' });
    } catch (error) {
        console.error('Error sending email change OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

export const verifyEmailChangeOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        // Check if OTP matches and is not expired
        if (!user || user.emailChangeOtp !== otp || user.newEmail !== email) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        
        if (Date.now() > user.emailChangeOtpExpiry) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Update user's email
        user.email = email;
        user.emailChangeOtp = undefined;
        user.emailChangeOtpExpiry = undefined;
        user.newEmail = undefined;
        
        await user.save();

        res.status(200).json({ 
            message: 'Email updated successfully',
            email: user.email
        });
    } catch (error) {
        console.error('Error verifying email change OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};

export const resendEmailChangeOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user._id;

        // Generate a new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update OTP in database with new expiry (10 minutes)
        await User.findByIdAndUpdate(userId, {
            emailChangeOtp: otp,
            emailChangeOtpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
            newEmail: email
        });

        // Send OTP to the new email address
        // Implement your email sending logic here
        
        // For development, you can console log the OTP
        console.log(`New OTP for email change: ${otp}`);

        res.status(200).json({ message: 'OTP resent to your new email address' });
    } catch (error) {
        console.error('Error resending email change OTP:', error);
        res.status(500).json({ message: 'Failed to resend OTP' });
    }
};

export {
    createUser,
    loginUser,
    logoutCurrentUser,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    googleLogin,
    checkEmail,
    resetPassword,
};
