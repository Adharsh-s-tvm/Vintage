import Cart from "../models/product/cartModel.js";
import Product from "../models/product/productModel.js";
import Variant from "../models/product/sizeVariantModel.js";

// Add to cart
export const addToCart = async (req, res) => {
    try {
        const { variantId, quantity } = req.body;
        const userId = req.user._id;

        // Check if variant exists and is not blocked
        const variant = await Variant.findById(variantId).populate({
            path: 'product',
            populate: ['category', 'brand']
        });

        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        // Check if variant or product is blocked/unlisted
        if (
            variant.isBlocked ||
            variant.product.isBlocked ||
            !variant.product.isListed ||
            variant.product.category.isBlocked ||
            variant.product.brand.isBlocked
        ) {
            return res.status(400).json({ message: "Product is not available" });
        }

        // Check stock
        if (variant.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if variant already in cart
        const existingItem = cart.items.find(item =>
            item.variant.toString() === variantId
        );

        if (existingItem) {
            // Check if new total quantity exceeds stock
            if (existingItem.quantity + quantity > variant.stock) {
                return res.status(400).json({ message: "Insufficient stock" });
            }
            // Update quantity and total price if already in cart
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
        } else {
            // Add new item with price and total price
            cart.items.push({
                variant: variantId,
                quantity,
                price: variant.price,
                totalPrice: variant.price * quantity
            });
        }

        await cart.save();

        // Populate cart details
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.variant',
                populate: {
                    path: 'product',
                    populate: ['category', 'brand']
                }
            });

        res.status(200).json(populatedCart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: "Error adding to cart" });
    }
};

// Get cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.variant',
                populate: {
                    path: 'product',
                    populate: ['category', 'brand']
                }
            });

        if (!cart) {
            return res.status(200).json({
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0
            });
        }

        // Filter out any blocked/unlisted items
        cart.items = cart.items.filter(item => {
            const variant = item.variant;
            const product = variant.product;
            return !(
                variant.isBlocked ||
                product.isBlocked ||
                !product.isListed ||
                product.category.isBlocked ||
                product.brand.isBlocked
            );
        });

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: "Error fetching cart" });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { variantId, quantity } = req.body;
        const userId = req.user._id;

        if (quantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartItem = cart.items.find(item =>
            item.variant.toString() === variantId
        );

        if (!cartItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Check stock
        const variant = await Variant.findById(variantId);
        if (variant.stock < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        cartItem.quantity = quantity;
        cartItem.totalPrice = cartItem.price * quantity;
        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.variant',
                populate: {
                    path: 'product',
                    populate: ['category', 'brand']
                }
            });

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: "Error updating cart item" });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { variantId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item =>
            item.variant.toString() !== variantId
        );

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.variant',
                populate: {
                    path: 'product',
                    populate: ['category', 'brand']
                }
            });

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: "Error removing from cart" });
    }
};
