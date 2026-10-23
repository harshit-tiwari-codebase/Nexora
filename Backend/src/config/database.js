import mongoose from "mongoose";

async function connectToDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing database configuration: set MONGODB_URI.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to Database");
}

export default connectToDB;