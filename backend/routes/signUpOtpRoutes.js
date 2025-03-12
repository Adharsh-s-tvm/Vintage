import express from "express";
import { sendOTP} from "../controllers/signUpOtpController.js";
import { verifyOTP } from "../controllers/signUpOtpController.js";

const router = express.Router();

router.post("/send", sendOTP);
router.post("/verify", verifyOTP);
// router.post("/resend", resendOtp);

export default router;
