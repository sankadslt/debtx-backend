import mongoose from "mongoose";

const chartDataSchema = new mongoose.Schema({
  drc_location: { type: String, required: true },
  month_01: { type: Number, required: true },
  month_02: { type: Number, required: true },
  month_03: { type: Number, required: true },
});

const ChartData = mongoose.model("ChartData", chartDataSchema);
export default ChartData;
