import express from "express";
import TaskList from "../models/TaskList.js"; // Ensure this is correctly imported

const router = express.Router();

// GET: Fetch tasks with pagination
router.get("/task", async (req, res) => {
  try {
    let { limit, skip } = req.query;

    limit = parseInt(limit) || 10;
    skip = parseInt(skip) || 0;

    const tasks = await TaskList.find().limit(limit).skip(skip);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// PATCH: Update task completion status
router.patch("/task/:id", async (req, res) => {
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
