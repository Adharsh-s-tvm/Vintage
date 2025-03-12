import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:7000/api/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Extract First & Last Name
          const fullName = profile.displayName.split(" ");
          const firstName = fullName[0] || "Google";
          const lastName = fullName.slice(1).join(" ") || "User";

          // Generate a unique username
          let baseUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
          let username = baseUsername;
          let counter = 1;

          // Check if the username already exists
          while (await User.findOne({ username })) {
            username = `${baseUsername}_${counter}`;
            counter++;
          }

          user = await User.create({
            googleId: profile.id,
            firstname: firstName,
            lastname: lastName,
            username: username,
            email: profile.emails[0].value,
            password: "google-oauth", // Dummy password
          });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);



passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
