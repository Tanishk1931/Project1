import {v2 as cloudinary} from ('cloudinary');
import fs from ('fs');


cloudinary.config({ 
  cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
  api_key: 'process.env.CLOUDINARY_API_KEY', 
  api_secret: 'process.env.CLOUDINARY_API_SECRET'
});


const uploadToCloudinary= async (filePath)=>{
  try{
    if(!fs.existsSync(filePath)){
    const response= await cloudinary.uploader.upload(filePath, {resource_type: "auto"});
    console.log("Upload successful:", response.url);  
    return response;
  }
}
  catch(error){
    fs.unlinkSync(filePath);// Delete the temporary saved file after upload operation failed
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
export {uploadToCloudinary};
// Example usage
uploadToCloudinary('path/to/myimage.jpg', 
  {folder: "my_app_images",
  overwrite: true, 
  notification_url: "https://mysite.example.com/notify_endpoint"})
.then(result=>console.log(result));

