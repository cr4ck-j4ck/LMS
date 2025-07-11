// src/auth/google.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

// 👇 Load your credentials (Client ID & Secret)

declare module "passport-google-oauth20" {
  interface Profile {
    accessToken?: string;
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!, // Load from .env file
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.REDIRECT_URL,
      passReqToCallback:true
    },
    async (req,accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      return done(null,profile)
    }
  )
);

// Save user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Load user from session
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});
