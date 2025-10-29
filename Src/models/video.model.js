import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


const videoSchema = new Schema({
 videoFile: { type: String, required: true },
 thumbnail: { type: String, required: true },
 title: { type: String, required: true, trim : true, index : true },
 description: { type: String, required: true, trim : true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true }, // duration in seconds
    tags: [{ type: String, trim : true, index : true }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, 
{ timestamps: true });


videoSchema.plugin(mongoosePaginate);
export const Video = mongoose.model("Video", videoSchema);
