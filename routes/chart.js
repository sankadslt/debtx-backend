import express from "express";
import ChartData from "../models/ChartData.js";
import caseDistributionDRCSummary from "../models/Case_distribution_drc_summary.js";

const router = express.Router();

// Endpoint to fetch chart data
router.get("/chart-data", async (req, res) => {
  try {
    const chartData = await caseDistributionDRCSummary.find();

    const labels = chartData.map((item) => item.drc_distribution?.rtom_details?.rtom);
    const datasets = [
      { label: "Month 01", data: chartData.map((item) => item.drc_distribution?.rtom_details?.month_1_sc) },
      { label: "Month 02", data: chartData.map((item) => item.drc_distribution?.rtom_details?.month_2_sc) },
      { label: "Month 03", data: chartData.map((item) => item.drc_distribution?.rtom_details?.month_3_sc) },
    ];

    res.json({ labels, datasets });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

export default router;
