import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
    getUserDetails,
    updateUserDetails,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    uploadProfileImage
} from '../controllers/userProfileController.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// User details routes
router.get("/details", authenticate, getUserDetails);
router.put("/details", authenticate, updateUserDetails);

// Address routes
router.get("/address", authenticate, getUserAddresses);
router.post("/address", authenticate, addUserAddress);
router.put("/address/:id", authenticate, updateUserAddress);
router.delete("/address/:id", authenticate, deleteUserAddress);

// Image upload route
router.post('/upload-image', authenticate, upload.single('image'), uploadProfileImage);

export default router;


