import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7days back

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.status(200).json(analyticsData, dailySalesData);
  } catch (error) {
    console.log("Error in analytics route", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
