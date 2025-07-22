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
const PORT = process.env.PORT || 3000;

// 🔧 More flexible CORS setup for debugging
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  // Add your exact Vercel domain here as backup
];

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

// 🐛 Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Cookie:', req.headers.cookie);
  next();
});

// 🔧 Updated CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('CORS Origin check:', origin);
      console.log('Allowed origins:', allowedOrigins);
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Handle preflight requests
app.options('*', cors());

// ⏺️ Connect-PG-Simple Setup
const PgSession = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 🔧 Test database connection
pgPool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// ⏺️ Updated Session Middleware
app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'session',
      createTableIfMissing: true, // 🔧 Add this line
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // 🔧 Custom session name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // 🔧 Only secure in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 🔧 Conditional sameSite
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      domain: undefined, // 🔧 Let browser handle domain
    },
  })
);

// 🐛 Session debug middleware
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Is authenticated:', req.isAuthenticated?.());
  next();
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 🔧 Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    sessionId: req.sessionID,
    hasSession: !!req.session,
    isAuthenticated: req.isAuthenticated?.(),
  });
});

// ------------------- ROUTES ------------------- //
app.use(allRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});