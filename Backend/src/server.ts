import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth";
import dotenv from "dotenv";
import cors from "cors";
import allRoutes from "./Routes/routes";
import MongoStore from "connect-mongo";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const mongoUrl = process.env.MONGODB_ATLAS_URL || "";

const sessionStore = MongoStore.create({
  mongoUrl,
  collectionName: "sessions",
  ttl: 60 * 60 * 24, // 1 day
});
app.set('trust proxy', 1);

// ⏺️ Session Middleware
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
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
