import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";  
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim : true, index : true },
  email: { type: String, required: true, unique: true, lowercase: true , trim : true},
  fullname: { type: String, required: true, trim : true, index : true },
  avatar: { type: String , required : true},
  coverImage: { type: String },
  password: { type: String, required:[true , "Password is required"] },
  watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
  likedVideos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  subscribedChannels: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  refreshToken: { type: String },
}
, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
// Method to generate access token
userSchema.methods.generateAccessToken = function () {
  const payload = { id: this._id, name: this.name, email: this.email, fullname: this.fullname };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
  return token;
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const payload = { id: this._id };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
  return token;
};
const User = mongoose.model("User", userSchema);

export default User;