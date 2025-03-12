import express from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import { getAllShopBrands, getAllShopCategories, getAllShopProducts, getProductById } from "../controllers/userProductController.js";


const router = express.Router();



router.get("/", asyncHandler(getAllShopProducts));

router.get('/categories', asyncHandler(getAllShopCategories))

router.get("/brands", asyncHandler(getAllShopBrands))

router.get('/:id', getProductById);

export default router