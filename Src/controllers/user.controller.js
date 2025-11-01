import {asynchandler} from '../middlewares/asyncHandler.js';

const registerUser = asynchandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        user: req.user // Assuming req.user is populated by an authentication middleware
    });
});

export { registerUser };