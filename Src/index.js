import app from "./App.js";

// const PORT = 4000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });



import connectDatabase from "./db/index.js";


connectDatabase()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    console.log("Database connection established");
})
.catch((error) => {
  console.error("Database connection error:", error);
});
















// app.use(express.json());
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`) 
//     app.once("error", (error) => {
//       console.error("Express error:", error);
//     })
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// })();