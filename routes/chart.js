import express from "express";
import ChartData from "../models/ChartData.js";

const router = express.Router();

// Endpoint to fetch chart data
router.get("/chart-data", async (req, res) => {
  try {
    const chartData = await ChartData.find();

    const labels = chartData.map((item) => item.drc_location);
    const datasets = [
      { label: "Month 01", data: chartData.map((item) => item.month_01) },
      { label: "Month 02", data: chartData.map((item) => item.month_02) },
      { label: "Month 03", data: chartData.map((item) => item.month_03) },
    ];

    res.json({ labels, datasets });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

export default router;
