import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getUserDetails } from '../controllers/userProfileController.js'



const router = express.Router()




router.get("/details", authenticate, getUserDetails);






export default router;


