import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
    getUserDetails,
    updateUserDetails,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress
} from '../controllers/userProfileController.js';

const router = express.Router();

// User details routes
router.get("/details", authenticate, getUserDetails);
router.put("/details", authenticate, updateUserDetails);

// Address routes
router.get("/address", authenticate, getUserAddresses);
router.post("/address", authenticate, addUserAddress);
router.put("/address/:id", authenticate, updateUserAddress);
router.delete("/address/:id", authenticate, deleteUserAddress);

export default router;


