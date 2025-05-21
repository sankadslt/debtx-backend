import express from "express";
import { registerUser, loginUser, refreshToken, getUserData } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

// Refresh Token Route
router.post("/refresh-token", refreshToken);

// Logout Route - Clear cookies
router.post("/logout", (req, res) => {
  // Clear cookies
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
 
export default router;