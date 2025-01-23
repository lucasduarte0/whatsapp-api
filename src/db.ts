import mongoose from "mongoose";
import config from "./config";

const { mongoUri, mongoDbName } = config;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      dbName: mongoDbName,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
