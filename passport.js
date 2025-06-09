import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "./models/User.js";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check if user already exists in DB
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          return done(null, false, { message: "User not registered. Contact admin." });
        }

        if (!existingUser.user_status) {
          return done(null, false, { message: "Account is disabled. Contact admin." });
        }

        // Create JWT token with accessToken key
        const payload = {
          user_id: existingUser.user_id,
          username: existingUser.username,
          role: existingUser.role,
          drc_id: existingUser.drc_id,
          ro_id: existingUser.ro_id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });

        return done(null, { accessToken: token });
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, false);
      }
    }
  )
);

// Serialize user (required for Passport even if session: false)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;