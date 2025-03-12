import express from "express";
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'
import {
  loginAdmin,
  logoutCurrentAdmin,
  getAllUsers,
  deleteUserById,
  getUserById,
  updateUserById,
  getDashboard,
  updateUserStatus
} from "../controllers/adminController.js";

const router = express.Router();


router.post("/login", loginAdmin);
router.post("/logout", logoutCurrentAdmin);
router.get("/dashboard", authenticate, authorizeAdmin, getDashboard);

router.get("/users", authenticate, authorizeAdmin, getAllUsers);

router
  .route("/users/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);


router.put("/users/:id/status", authenticate, authorizeAdmin, updateUserStatus);


export default router;
