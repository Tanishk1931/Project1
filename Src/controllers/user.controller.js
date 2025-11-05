import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import {user} from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
export const registerUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User registered",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    const { username, email, password } = req.body;
    console.log("Email:", email);
    console.log("Password:", password);

    if(
        [username, email, username, password].some((field) => field?.trim()==="")
    ) {
        return ApiError(400, "All fields are required", res);
    }

    const existingUser = await user.findOne({$or: [{ email }, { username }]});
    if (existingUser) {
        return ApiError(409, "User with this email or username already exists", res);
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath) {
        return ApiError(400, "Avatar image is required", res);
    }
    if(!coverImageLocalPath) {
        return ApiError(400, "Cover image is required", res);
    }

   const avatar = await uploadToCloudinary(avatarLocalPath);
   const coverImage = await uploadToCloudinary(coverImageLocalPath);

   if(!avatar || !coverImage) {
        throw new ApiError(500, "Image upload failed", res);
   }

   const newUser = await User.create({ 
        fullName, 
        username : username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage.url
    });

    const createUser = await User.findById(newUser._id).select("-password -refreshToken");
    if(!createUser) {
        return ApiError(500, "User creation failed", res);
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registered successfully")
    );
};

 
