import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth";
import dotenv from "dotenv";
import cors from "cors";
import allRoutes from "./Routes/routes";
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';


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


// ⏺️ Connect-PG-Simple Setup
const PgSession = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Railway
  },
});


// ⏺️ Session Middleware
app.use(
  session({
    store: new PgSession({
      pool: pgPool, // 🧠 use Railway PostgreSQL pool
      tableName: 'session', // optional (default is 'session')
    }),
    secret: process.env.SESSION_SECRET, // 🔐 keep this safe
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,         // ⚠️ Use `true` if your site is on HTTPS (Vercel, etc.)
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
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


