//packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors'
import morgan from "morgan";


// Utiles 
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from "./routes/adminRoutes.js";
import signUpOtpRoutes from './routes/signUpOtpRoutes.js'
import adminProductRoutes from './routes/adminProductRoutes.js'
import userProductRoutes from './routes/userProductRoutes.js'
import userProfileRoutes from './routes/userProfileRoutes.js'
import userCartRoutes from './routes/userCartRoutes.js'
import { errorHandler } from "./middlewares/errorHandler.js";
import userWishlistRoutes from './routes/userWishlistRoutes.js';
import userOrderRoutes from './routes/userOrderRoutes.js';


dotenv.config()
const port = process.env.PORT || 7000;

connectDB()

const app = express()
app.use(cors({
    origin: 'http://localhost:3000', // or whatever your frontend URL is
    credentials: true
}));


app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(morgan("dev"))

app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);


app.use("/api/admin/products", adminProductRoutes)

app.use("/api/products", userProductRoutes)

app.use("/api/user/otp", signUpOtpRoutes);

app.use("/api/user/profile", userProfileRoutes)

app.use("/api/user/cart", userCartRoutes)

app.use("/api/user/wishlist", userWishlistRoutes);

app.use('/api/user/orders', userOrderRoutes);

app.use(errorHandler)
app.listen(port, () => console.log(`Server running on port : ${port}`))