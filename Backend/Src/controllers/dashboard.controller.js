import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get channel statistics
 * @route   GET /api/v1/dashboard/stats
 * @access  Private (Channel owner)
 */
const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    // Total videos uploaded
    const totalVideos = await Video.countDocuments({
        owner: channelId,
    });

    // Total views across all videos
    const totalViewsAgg = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
            },
        },
    ]);

    const totalViews = totalViewsAgg[0]?.totalViews || 0;

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId,
    });

    // Total likes on all videos
    const totalLikesAgg = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData",
            },
        },
        { $unwind: "$videoData" },
        {
            $match: {
                "videoData.owner": new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: 1 },
            },
        },
    ]);

    const totalLikes = totalLikesAgg[0]?.totalLikes || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes,
            },
            "Channel statistics fetched successfully"
        )
    );
});

/**
 * @desc    Get all videos uploaded by the channel
 * @route   GET /api/v1/dashboard/videos
 * @access  Private (Channel owner)
 */
const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const videos = await Video.find({ owner: channelId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalVideos = await Video.countDocuments({ owner: channelId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                currentPage: Number(page),
                totalPages: Math.ceil(totalVideos / limit),
                videos,
            },
            "Channel videos fetched successfully"
        )
    );
});

export {
    getChannelStats,
    getChannelVideos,
};
