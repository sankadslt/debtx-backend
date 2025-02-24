import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import TaskList from "../models/TaskList.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();



router.post("/task", async (req, res) => {
  const { task, url, userEmail } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUserId = decoded.user_id; // Get logged-in user's ID from token

    // Find the assigned user by email
    const assignedUser = await User.findOne({ email: userEmail });

    if (!assignedUser) {
      return res.status(400).json({ message: "Assigned user not found" });
    }

    // Now, create the task with correct user IDs
    const taskData = new TaskList({
      task,
      url,
      user_id: assignedUser.user_id, // Assigned user's user_id
      created_by: loggedInUserId, // Logged-in user's user_id
    });

    await taskData.save();
    res.status(201).json(taskData); // Return the created task
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Error creating task", error });
  }
});


router.get("/task", verifyToken, async (req, res) => {
  try {
    const user_id = req.user?.user_id; // Ensure correct extraction

    if (!user_id) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    let { limit, skip } = req.query;
    limit = parseInt(limit) || 10;
    skip = parseInt(skip) || 0;

    const tasks = await TaskList.find({ user_id })
  .limit(limit)
  .skip(skip);

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});



// PATCH: Update task completion status
router.patch("/task/:id", verifyToken , async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const task = await TaskList.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
