import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';


// Add error handling for cloudinary configuration
console.log("Initializing Cloudinary storage...")




const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jackets',
        allowed_formats: ['jpg', 'png', 'jpeg', 'avif', 'webp'],
    },
});


//lllllll
cloudinary.config().cloud_name ?
    console.log("Cloudinary configured successfully") :
    console.log("Cloudinary configuration missing");


const upload = multer({ storage });

// export default upload;

const uploadFields = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 5 }
]);

const handleUpload = (req, res, next) => {
    console.log("Starting file upload...");

    // Create timeout that can be cleared
    let uploadTimeout = setTimeout(() => {
        console.error("Upload timeout after 30 seconds");
        if (!res.headersSent) {
            res.status(500).json({
                message: "Upload timeout - check Cloudinary configuration"
            });
        }
    }, 30000);

    uploadFields(req, res, (err) => {
        // Clear the timeout since upload completed (either success or error)
        clearTimeout(uploadTimeout);

        if (err) {
            console.error("Upload error:", err);
            return res.status(400).json({
                message: "File upload error",
                error: err.message
            });
        }

        console.log("Upload successful");
        console.log("Files received:", req.files);

        // Validate files
        if (!req.files) {
            return res.status(400).json({
                message: "No files were uploaded"
            });
        }

        if (!req.files.mainImage || !req.files.mainImage[0]) {
            return res.status(400).json({
                message: "Main image is required"
            });
        }

        if (!req.files.subImages || req.files.subImages.length === 0) {
            return res.status(400).json({
                message: "At least one sub image is required"
            });
        }

        next();
    });
};

export { handleUpload };