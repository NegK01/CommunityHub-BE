import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";

const PORT: number = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error("Error starting server:", error?.message || error);
    process.exit(1);
  }
};

startServer();
