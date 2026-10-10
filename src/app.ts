import express, { request, type Application } from "express";
import { IndexRoutes } from "./app/routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser"
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";

const app: Application = express();


const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000",process.env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin, e.g. Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      // Next.js frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Chrome extension
      if (origin.startsWith("chrome-extension://")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())


app.use("/", IndexRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hello World FROM DOCKER",
  });
});



// MUST be after routes
app.use(globalErrorHandler);

console.log("I am BATMAN");

export default app;
