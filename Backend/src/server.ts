import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth";
import dotenv from "dotenv";
import cors from "cors";
import FileStore from "session-file-store";
import allRoutes from "./Routes/routes";

dotenv.config();

const app = express();
const PORT = 3000;

const allowedOrigins = [process.env.FRONTEND_URL];

declare module "express-session" {
  interface SessionData {
    moodleAccessToken?: string;
    moodleInstituteName?: string;
    canvasInstituteName?: string;
    canvasAccessToken?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      accessToken?: string;
    }
  }
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const FileStoreInstance = FileStore(session);

// Setup session
app.use(
  session({
    store: new FileStoreInstance({}),
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ------------------- ROUTES ------------------- //
app.use(allRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
