import mongoose from "mongoose";
import Usage from "../../models/Usage.js";
import Project from "../../models/Project.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ✅ Helper to build match stage from query params
const buildMatchStage = async (req) => {
  const { projectId, apiKeyId, startDate, endDate } = req.query;
  const userId = req.user.userId;
  const matchStage = {};

  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    // Verify ownership
    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) {
      throw new Error("Forbidden"); // Signal 403
    }
    matchStage.projectId = new mongoose.Types.ObjectId(projectId);
  } else {
    const projects = await Project.find({ user: userId }).select("_id");
    matchStage.projectId = { $in: projects.map((p) => p._id) };
  }

  if (apiKeyId && mongoose.Types.ObjectId.isValid(apiKeyId)) {
    matchStage.apiKeyId = new mongoose.Types.ObjectId(apiKeyId);
  }

  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = new Date(startDate);
    if (endDate) matchStage.timestamp.$lte = new Date(endDate);
  }

  return matchStage;
};

// 📊 GET /api/usage/summary
export const getUsageSummary = asyncHandler(async (req, res) => {
  try {
    const matchStage = await buildMatchStage(req);

    const summary = await Usage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $lt: ["$statusCode", 400] }, 1, 0] }
          },
          errorCount: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] }
          },
          avgResponseTime: { $avg: "$responseTime" }
        }
      },
      {
        $project: {
          _id: 0,
          totalRequests: 1,
          successCount: 1,
          errorCount: 1,
          avgResponseTime: { $round: ["$avgResponseTime", 2] }
        }
      }
    ]);

    res.json(summary[0] || {
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      avgResponseTime: 0
    });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Not authorized" });
    throw err;
  }
});

// 📈 GET /api/usage/timeseries
export const getUsageTimeSeries = asyncHandler(async (req, res) => {
  try {
    const matchStage = await buildMatchStage(req);

    // Dynamic grouping: hour or day
    const { groupBy = "hour" } = req.query; // 'hour' or 'day'
    const format = groupBy === "day" ? "%Y-%m-%d" : "%Y-%m-%dT%H:00";

    const timeseries = await Usage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format, date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          time: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(timeseries);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Not authorized" });
    throw err;
  }
});

// 🏆 GET /api/usage/top-endpoints
export const getTopEndpoints = asyncHandler(async (req, res) => {
  try {
    const matchStage = await buildMatchStage(req);

    const topEndpoints = await Usage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$endpoint",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          endpoint: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(topEndpoints);
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ error: "Not authorized" });
    throw err;
  }
});
