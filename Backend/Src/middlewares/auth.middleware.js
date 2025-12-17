import { asyncHandler}  from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

 const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
   if (!token) {
       throw new apiError(401, "Unauthorized", res);
   }

  
       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       const user = await User.findById(decoded?._id).select("-password -refreshToken");
         if (!user) {
              throw new apiError(404, "Invalid Access Token", res);
   } 
   req.user = user;
   next();
   }
   catch (error) {
       throw new apiError(401, error?.message || "Unauthorized", res);
   }

});

export { verifyJWT };