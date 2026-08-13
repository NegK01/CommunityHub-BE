const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

module.exports = {
  connectDatabase
};