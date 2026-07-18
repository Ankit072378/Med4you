import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.APP_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.APP_CLOUDINARY_API_KEY,
    api_secret: process.env.APP_CLOUDINARY_SECRET_KEY,
});

export const uploadMultiple = async (req, res, next) => {
    try {
        const images = req.files;
        // console.log(images);
        const imageUrls = [];
        for (const image of images) {
            const result = await cloudinary.uploader.upload(image.path, {
                resource_type: "auto",
            });
            imageUrls.push(result.secure_url);
        }
        req.images = imageUrls;
        console.log("Cloudinary URLs:", req.images);
        next();
        // res.status(200).json({
        //     message: "Files uploaded successfully",
        //     urls: imageUrls,
        // });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Internal Error at uploadMultiple.js ${error}`,
        });
    }
};
