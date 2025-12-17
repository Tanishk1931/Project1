import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse  from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Subscribe / Unsubscribe to a channel
 * @route   POST /api/v1/subscriptions/:channelId
 * @access  Private
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId,
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res.status(200).json(
            new ApiResponse(
                200,
                { subscribed: false },
                "Unsubscribed successfully"
            )
        );
    }

    await Subscription.create({
        channel: channelId,
        subscriber: subscriberId,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { subscribed: true },
            "Subscribed successfully"
        )
    );
});

/**
 * @desc    Get all subscribers of a channel
 * @route   GET /api/v1/subscriptions/channel/:channelId
 * @access  Public
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers: subscribers.length,
                subscribers,
            },
            "Channel subscribers fetched successfully"
        )
    );
});

/**
 * @desc    Get channels a user has subscribed to
 * @route   GET /api/v1/subscriptions/user/:subscriberId
 * @access  Public
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({
        subscriber: subscriberId,
    }).populate("channel", "username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscriptions: channels.length,
                channels,
            },
            "Subscribed channels fetched successfully"
        )
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};
