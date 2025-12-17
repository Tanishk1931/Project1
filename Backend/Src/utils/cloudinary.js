 import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
  cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
  api_key: 'process.env.CLOUDINARY_API_KEY', 
  api_secret: 'process.env.CLOUDINARY_API_SECRET'
});


const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      console.log("File not found at:", localFilePath);
      return null;
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file is Uploaded on Cloudinary:", result.url);

    fs.unlinkSync(localFilePath); // delete after upload ✅

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath); // delete even if upload fails ✅
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export default uploadToCloudinary;