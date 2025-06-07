// import express from "express";
// import { registerUser, loginUser, refreshToken, getUserData } from "../controllers/authController.js";
// import { verifyToken } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// // Register Route
// router.post("/register", registerUser);

// // Login Route
// router.post("/login", loginUser);

// // Refresh Token Route
// router.post("/refresh-token", refreshToken);

// // Logout Route - Clear cookies
// router.post("/logout", (req, res) => {
//   // Clear cookies
//   res.clearCookie("accessToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "Strict",
//   });
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "Strict",
//   });

//   res.status(200).json({ message: "Logged out successfully" });
// });

// // User Data Route
// router.get("/user", verifyToken, getUserData);

// export default router;

import express from "express";
import passport from "passport";
import { registerUser, loginUser, refreshToken, getUserData, handleAzureLogin } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

//Refresh Token Route
router.post("/refresh-token", refreshToken);

// Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// User Data Route
router.get("/user", verifyToken, getUserData);

// Google Login Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: (`${process.env.CLIENT_URL}/unauthorized`),
    session: false,
  }),
  (req, res) => {
    const accessToken = req.user.accessToken;
    res.redirect(`${process.env.CLIENT_URL}/google-login?accessToken=${accessToken}`);
    // console.log("ACCT "+ accessToken)
  }
);

//aure login route
router.post("/azure", handleAzureLogin);

export default router;