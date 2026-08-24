import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("falta la variable de entorno mongodb_uri");
  }

  await mongoose.connect(mongoUri);
};

export default { connectDatabase };
