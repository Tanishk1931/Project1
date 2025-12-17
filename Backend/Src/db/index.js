import mongoose from "mongoose";


 const connectDatabase = async () => {
  mongoose.connect("mongodb+srv://Tanishk:Tanishk19313@tanishk1912.a7lveoy.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));
 };
export default connectDatabase;
