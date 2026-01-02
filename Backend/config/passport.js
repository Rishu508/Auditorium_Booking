const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User.model");

const backendUrl = process.env.BACKEND_URL
  ? process.env.BACKEND_URL.replace(/\/$/, "")
  : "";
const callbackURL = `${backendUrl}/api/auth/google/callback`;

console.log("DEBUG: BACKEND_URL from env:", process.env.BACKEND_URL);
console.log("DEBUG: Generated Callback URL:", callbackURL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user with same googleId
        let user = await User.findOne({ googleId: profile.id });

        // If new Google user -> create in DB
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            Firstname: profile.name.givenName,
            Lastname: profile.name.familyName,
            email: profile.emails[0].value,
          });
        }

        // Send user to Passport
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
