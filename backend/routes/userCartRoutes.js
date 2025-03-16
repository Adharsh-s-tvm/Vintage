import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/userCartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all cart routes
router.use(protect);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update", updateCartItem);
router.delete("/remove/:variantId", removeFromCart);

export default router;
