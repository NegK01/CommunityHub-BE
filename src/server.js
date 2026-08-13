require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};

startServer();