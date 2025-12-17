import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  uploadOnCloudinary  from "../utils/cloudinary.js";

/**
 * @desc    Get all videos (search, filter, sort, pagination)
 * @route   GET /api/v1/videos
 * @access  Public
 */
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId,
    } = req.query;

    const filter = { isPublished: true };

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOptions = {
        [sortBy]: sortType === "asc" ? 1 : -1,
    };

    const videos = await Video.find(filter)
        .populate("owner", "username avatar")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                currentPage: Number(page),
                totalPages: Math.ceil(totalVideos / limit),
                videos,
            },
            "Videos fetched successfully"
        )
    );
});

/**
 * @desc    Upload & publish a video
 * @route   POST /api/v1/videos
 * @access  Private
 */
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    if (!req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoUpload = await uploadOnCloudinary(
        req.files.videoFile[0].path,
        "video"
    );

    const thumbnailUpload = await uploadOnCloudinary(
        req.files.thumbnail[0].path,
        "image"
    );

    if (!videoUpload?.url || !thumbnailUpload?.url) {
        throw new ApiError(500, "File upload failed");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner: req.user._id,
        views: 0,
        isPublished: true,
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
});

/**
 * @desc    Get video by ID (+ view count)
 * @route   GET /api/v1/videos/:videoId
 * @access  Public
 */
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate(
        "owner",
        "username avatar"
    );

    if (!video || !video.isPublished) {
        throw new ApiError(404, "Video not found");
    }

    video.views += 1;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

/**
 * @desc    Update video details
 * @route   PUT /api/v1/videos/:videoId
 * @access  Private (Owner only)
 */
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to update this video");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    if (req.files?.thumbnail) {
        const thumbnailUpload = await uploadOnCloudinary(
            req.files.thumbnail[0].path,
            "image"
        );
        video.thumbnail = thumbnailUpload.url;
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

/**
 * @desc    Delete a video
 * @route   DELETE /api/v1/videos/:videoId
 * @access  Private (Owner only)
 */
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to delete this video");
    }

    await video.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

/**
 * @desc    Toggle publish/unpublish video
 * @route   PATCH /api/v1/videos/:videoId/publish
 * @access  Private (Owner only)
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to change publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { isPublished: video.isPublished },
            "Publish status updated"
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
