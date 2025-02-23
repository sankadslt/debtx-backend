import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Short lifespan for access tokens
  );

  const refreshToken = jwt.sign(
    { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "1d" } // Longer lifespan for refresh tokens
  );

  return { accessToken, refreshToken };
};

// Register a new user
export const registerUser = async (req, res) => {
  const { user_id, user_type, username, email, password, role, created_by, login_method } = req.body;

  try {
    if (!user_id || !user_type || !username || !email || !password || !role || !created_by || !login_method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ user_id, user_type, username, email, password: hashedPassword, role, created_by, login_method });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "Strict", // Prevent CSRF
      maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken, username: user.username });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Refresh tokens
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new tokens
    const user = { user_id: decoded.user_id, username: decoded.username, email: decoded.email, role: decoded.role };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Set the new refresh token in HttpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken, username: decoded.username });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Get user data by user_id
export const getUserData = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).select("-password"); // Exclude password for security
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data", error: error.message });
  }
};