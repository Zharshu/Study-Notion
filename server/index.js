const express = require("express");
const app = express();

// Import dependencies
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Import new aggregated routes
const routes = require("./routes");

// Import error handling middleware
const errorHandler = require("./shared/middlewares/error.middleware");

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 4000;

// Database connect
database.connect();

// CORS configuration (Must be defined before usage)
const allowedOrigins = [
  "http://localhost:3000",
  "https://study-notion-harshit.onrender.com",
  process.env.FRONTEND_URL || "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions)); // CORS must be first
app.use(express.json());
app.use(cookieParser());

// Security Middlewares
const {
  securityHeaders,
  limiter,
} = require("./shared/middlewares/security.middleware");
app.use(securityHeaders);
app.use(limiter);

// Logging Middleware
const loggerMiddleware = require("./shared/middlewares/logger.middleware");
app.use(loggerMiddleware);

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  }),
);

// Cloudinary connection
cloudinaryConnect();

// API Routes - New structure
app.use("/api/v1", routes);

// Root route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

// Global Error Handling Middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
