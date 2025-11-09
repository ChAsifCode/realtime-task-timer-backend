import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";

const app = express();

app.use(express.json({
  limit: "50mb",
  verify: (req, res, buf) => {
    if (req.originalUrl === "/api/v1/stripe/webhook") {
      req.rawBody = buf;
    }
  },
}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));
const allowedOrigins = [
  "http://localhost:3030",
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl/postman) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "PUT", "DELETE", "POST", "OPTIONS", "HEAD", "PATCH"],
}));
app.use(cookieParser());
// ✅ Fix Helmet for cross-origin images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, // avoid COEP blocking
}));
app.use(morgan(":method :url :status - :response-time ms - :res[content-length]", {
  skip: (req, res) => req.url === "/",
}));
// app.use(mongoSanitize());

export default app;

