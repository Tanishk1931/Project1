import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Toggle like on a video
 * @route   POST /api/v1/likes/video/:videoId
 * @access  Private
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked successfully")
        );
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Video liked successfully")
    );
});

/**
 * @desc    Toggle like on a comment
 * @route   POST /api/v1/likes/comment/:commentId
 * @access  Private
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment unliked successfully")
        );
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Comment liked successfully")
    );
});

/**
 * @desc    Toggle like on a tweet
 * @route   POST /api/v1/likes/tweet/:tweetId
 * @access  Private
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
        );
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true }, "Tweet liked successfully")
    );
});

/**
 * @desc    Get all videos liked by the user
 * @route   GET /api/v1/likes/videos
 * @access  Private
 */
const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({
        likedBy: req.user._id,
        video: { $ne: null },
    }).populate("video");

    return res.status(200).json(
        new ApiResponse(200, likes, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};
