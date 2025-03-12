import User from "../models/userModel.js";
import Otp from "../models/otp/signUpOtpModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { oauth2client } from "../utils/googleConfig.js";
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

    // If we get here, both email and password are valid
    const token = createToken(res, existingUser._id);

    res.status(200).json({
        success: true,
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        token: token // Include token in response if needed on frontend
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


export {
    createUser,
    loginUser,
    logoutCurrentUser,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    googleLogin,
};
