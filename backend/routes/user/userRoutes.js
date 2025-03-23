import express from "express";
import {
    createUser,
    loginUser,
    logoutCurrentUser,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    googleLogin,
    checkEmail,
    resetPassword,
} from "../../controllers/user/userController.js";

import { authenticate, authorizeAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router
    .route("/signup")
    .post(createUser)

router.post("/login", loginUser);

router.post("/logout", logoutCurrentUser);

router
    .route("/profile")
    .get(authenticate, getCurrentUserProfile)
    .put(authenticate, updateCurrentUserProfile);

router.post('/google', googleLogin)

router.post("/check-email", checkEmail);
router.post("/reset-password", resetPassword);



export default router;
