import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create a playlist
 * @route   POST /api/v1/playlist
 * @access  Private
 */
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});

/**
 * @desc    Get all playlists of a user
 * @route   GET /api/v1/playlist/user/:userId
 * @access  Public
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId }).sort({
        createdAt: -1,
    });

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

/**
 * @desc    Get playlist by ID
 * @route   GET /api/v1/playlist/:playlistId
 * @access  Public
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username avatar");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

/**
 * @desc    Add video to playlist
 * @route   POST /api/v1/playlist/:playlistId/video/:videoId
 * @access  Private (Owner only)
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to modify this playlist");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist")
    );
});

/**
 * @desc    Remove video from playlist
 * @route   DELETE /api/v1/playlist/:playlistId/video/:videoId
 * @access  Private (Owner only)
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to modify this playlist");
    }

    playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId
    );

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist")
    );
});

/**
 * @desc    Update playlist details
 * @route   PUT /api/v1/playlist/:playlistId
 * @access  Private (Owner only)
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to update this playlist");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});

/**
 * @desc    Delete a playlist
 * @route   DELETE /api/v1/playlist/:playlistId
 * @access  Private (Owner only)
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to delete this playlist");
    }

    await playlist.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
