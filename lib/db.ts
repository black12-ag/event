import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to database");
  } catch (error) {
    console.log("Failed to connect to database");
    console.error(error);
  }
};

export default connectToDatabase;
