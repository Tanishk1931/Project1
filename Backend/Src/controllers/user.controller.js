
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import  uploadToCloudinary  from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessandRefreshToken = async(userId) => {
    // Implementation for generating tokens
    try{
        // Token generation logic here
        const user = await User.findById(userId)
        const accessToken = user.generateAccesToken(); // Replace with actual token generation
        const refreshToken = user.generateRefreshToken(); // Replace with actual token generation

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    }
    catch(error){
     throw new ApiError(500, "Token generation failed");
        
    }
}

 const registerUser = asyncHandler(async(req, res) => {
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
        throw new ApiError(400, "All fields are required", res);
    }

    const existingUser = await User.findOne({$or: [{ email }, { username }]});
    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists", res);
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required", res);
    }
    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required", res);
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
        throw new ApiError(500, "User creation failed", res);
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registered successfully")
    );
});

 const loginUser = asyncHandler(async(req,res) => {
    const { email,username,password } =req.body;
    if(!username && !email) {
        throw new ApiError(400, "Username or email is required", res);
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });
    if(!user) {
        throw new ApiError(404, "User not found", res);
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password", res);
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
    );  
});

const logOutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(req.user.id, { $set : { refreshToken: undefined } }, { new: true });
    
    const options = {
        httpOnly: true,
        secure: true
    };
    res.status(200)
    .clearCookie("accessToken", null, options)
    .clearCookie("refreshToken", null, options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});
 
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordValid(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});


const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Image upload failed");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatar.url },
        { new: true }
    ).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, user, "User avatar updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }
    const coverImage = await uploadToCloudinary(coverImageLocalPath); 
    if (!coverImage) {
        throw new ApiError(500, "Image upload failed");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { coverImage: coverImage.url },
        { new: true }
    ).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, user, "User cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;  
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User channel profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    // Implementation for fetching watch history
    const user = await User.findById(req.user._id).populate({
        path: "watchHistory",
        populate: {
            path: "video",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, user, "Watch history fetched successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, username, email } = req.body; 
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (username) updates.username = username.toLowerCase();
    if (email) updates.email = email;
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
    ).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

export{generateAccessandRefreshToken, registerUser, loginUser, logOutUser, changeCurrentPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, updateAccountDetails};