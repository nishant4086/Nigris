import crypto from "crypto";
import mongoose from "mongoose";
import ApiKey from "../../models/ApiKey.js";
import Project from "../../models/Project.js";
import User from "../../models/User.js";
import Usage from "../../models/Usage.js";
import Alert from "../../models/Alert.js";
import { Parser } from "json2csv";
import { analyticsEmitter } from "../../utils/analyticsEmitter.js";
import { generateApiKey } from "../../utils/generateApiKey.js";
import { decryptApiKey, encryptApiKey } from "../../utils/apiKeyCrypto.js";
import { ensurePlans, getPlanByName } from "../../utils/planUtils.js";
import { getPlanLimits } from "../../utils/planLimits.js";


// ➕ CREATE API KEY (PLAN BASED)
export const createApiKey = async (req, res, next) => {
  try {
    const { projectId, name, environment, permissions } = req.body;
    const userId = req.user?.userId;

    // ✅ Validate projectId
    if (!projectId) {
      return res.status(400).json({ message: "projectId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔐 Authorization
    if (project.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔒 PLAN LIMIT CHECK
    const user = await User.findById(userId);
    const limits = getPlanLimits(user?.plan);
    if (limits.maxApiKeys > 0) {
      const keyCount = await ApiKey.countDocuments({ user: userId });
      if (keyCount >= limits.maxApiKeys) {
        return res.status(403).json({
          message: `API key limit reached (${limits.maxApiKeys}). Upgrade your plan to create more.`,
          limitReached: true,
          current: keyCount,
          max: limits.maxApiKeys,
        });
      }
    }

    // 🔑 Generate API key with prefix
    const rawKey = `nigris_${generateApiKey()}`;
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    const maskedKey = rawKey.substring(0, 11) + "****" + rawKey.substring(rawKey.length - 4);
    const { encryptedKey, keyIv, keyTag } = encryptApiKey(rawKey);

    // 🔥 GET USER PLAN
    await ensurePlans();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 GET PLAN DATA
    const plan = await getPlanByName(user.plan);

    if (!plan) {
      console.error("[ApiKey] Plan not found for user:", userId, "plan:", user.plan);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // 📦 CREATE API KEY
    const apiKey = await ApiKey.create({
      hashedKey,
      encryptedKey,
      keyIv,
      keyTag,
      maskedKey,
      environment: environment || "Development",
      user: userId,
      project: projectId,
      name,

      // 🔥 PLAN BASED LIMIT
      limit: plan.requestLimit,
      usage: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      permissions: permissions || ["read"],
    });

    // Only return the raw key ONCE during creation
    res.status(201).json({ ...apiKey.toObject(), key: rawKey });
  } catch (error) {
    next(error);
  }
};


// 📥 GET ALL API KEYS
export const getApiKeys = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const keys = await ApiKey.find({ user: userId })
      .select("-hashedKey +encryptedKey +keyIv +keyTag")
      .populate("project", "name");

    const response = keys.map((key) => {
      const revealable = Boolean(key.encryptedKey && key.keyIv && key.keyTag);
      const data = key.toObject();
      delete data.encryptedKey;
      delete data.keyIv;
      delete data.keyTag;
      return { ...data, revealable };
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
};


// ❌ DELETE API KEY
export const deleteApiKey = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const key = await ApiKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }

    if (key.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await key.deleteOne();

    res.json({ message: "API key deleted" });
  } catch (error) {
    next(error);
  }
};


// 📊 USAGE DASHBOARD
export const getUsage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const keys = await ApiKey.find({ user: userId })
      .populate("project", "name");

    const usageData = keys.map((key) => ({
      id: key._id,
      name: key.name,
      project: key.project?.name,
      usage: key.usage,
      limit: key.limit,
      remaining: Math.max(key.limit - key.usage, 0),
      resetAt: key.resetAt,
      isActive: key.isActive,
    }));

    res.json(usageData);
  } catch (error) {
    next(error);
  }
};

// ✏️ UPDATE API KEY
export const updateApiKey = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { name, isActive, rotate, permissions } = req.body || {};

    const key = await ApiKey.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }

    if (key.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      key.name = name;
    }

    if (typeof isActive === "boolean") {
      key.isActive = isActive;
    }

    if (permissions && Array.isArray(permissions)) {
      // Validate permissions
      const validPermissions = ["read", "write", "admin"];
      if (permissions.every(p => validPermissions.includes(p))) {
        key.permissions = permissions;
      }
    }

    if (rotate) {
      const newRawKey = `nigris_${generateApiKey()}`;
      key.hashedKey = crypto.createHash("sha256").update(newRawKey).digest("hex");
      key.maskedKey = newRawKey.substring(0, 11) + "****" + newRawKey.substring(newRawKey.length - 4);
      const encrypted = encryptApiKey(newRawKey);
      key.encryptedKey = encrypted.encryptedKey;
      key.keyIv = encrypted.keyIv;
      key.keyTag = encrypted.keyTag;
      key.usage = 0;
      key.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await key.save();
      return res.json({ ...key.toObject(), key: newRawKey });
    }

    await key.save();
    res.json(key);
  } catch (error) {
    next(error);
  }
};

// 🔍 REVEAL API KEY (OWNER ONLY)
export const revealApiKey = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const key = await ApiKey.findById(req.params.id).select(
      "+encryptedKey +keyIv +keyTag"
    );

    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }

    if (key.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!key.encryptedKey || !key.keyIv || !key.keyTag) {
      return res.status(400).json({ message: "API key cannot be revealed" });
    }

    const rawKey = decryptApiKey({
      encryptedKey: key.encryptedKey,
      keyIv: key.keyIv,
      keyTag: key.keyTag,
    });

    res.json({ key: rawKey });
  } catch (error) {
    next(error);
  }
};

// 📊 USAGE SUMMARY
export const getUsageSummary = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const keys = await ApiKey.find({ user: userId });

    const totalUsage = keys.reduce((sum, key) => sum + (key.usage || 0), 0);
    const totalLimit = keys.reduce((sum, key) => sum + (key.limit || 0), 0);
    const remaining = Math.max(totalLimit - totalUsage, 0);

    const nextResetAt = keys
      .map((key) => key.resetAt)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b))[0];

    res.json({ totalUsage, totalLimit, remaining, nextResetAt });
  } catch (error) {
    next(error);
  }
};
// 📈 GET TIME SERIES USAGE
export const getAnalyticsTimeSeries = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { days = 30, projectId = "all", apiKeyId = "all" } = req.query;
    
    // Get user-owned projects first and optionally narrow down by selected project.
    const projects = await Project.find({ user: userId }).select("_id");
    const ownedProjectIds = projects.map((p) => p._id);
    let projectIds = ownedProjectIds;

    if (projectId !== "all") {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid project filter" });
      }
      const projectExists = ownedProjectIds.some((id) => id.toString() === projectId.toString());
      if (!projectExists) {
        return res.status(403).json({ message: "Project access denied" });
      }
      projectIds = [new mongoose.Types.ObjectId(projectId)];
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const matchStage = {
      projectId: { $in: projectIds },
      timestamp: { $gte: startDate },
    };

    if (apiKeyId !== "all") {
      if (!mongoose.Types.ObjectId.isValid(apiKeyId)) {
        return res.status(400).json({ message: "Invalid API key filter" });
      }
      const key = await ApiKey.findOne({ _id: apiKeyId, user: userId }).select("_id");
      if (!key) {
        return res.status(403).json({ message: "API key access denied" });
      }
      matchStage.apiKeyId = new mongoose.Types.ObjectId(apiKeyId);
    }

    const timeSeries = await Usage.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          requests: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0
    const filledData = [];
    let currentDate = new Date(startDate);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const existingData = timeSeries.find(d => d._id === dateString);
      
      filledData.push({
        date: dateString,
        requests: existingData ? existingData.requests : 0,
        errors: existingData ? existingData.errors : 0,
        isAnomaly: false
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Anomaly Detection (Spike > 2x average of previous 7 days)
    for (let i = 7; i < filledData.length; i++) {
      const pastWeek = filledData.slice(i - 7, i);
      const avg = pastWeek.reduce((sum, d) => sum + d.requests, 0) / 7;
      if (avg > 10 && filledData[i].requests > avg * 2) {
        filledData[i].isAnomaly = true;
      }
    }

    // Check if the very last day (today) is an anomaly, and if we haven't alerted yet today
    const todayData = filledData[filledData.length - 1];
    if (todayData && todayData.isAnomaly) {
      const existingAlert = await Alert.findOne({
        userId,
        type: "anomaly",
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      });
      if (!existingAlert) {
        const alert = await Alert.create({
          userId,
          type: "anomaly",
          message: `Unusual traffic spike detected today: ${todayData.requests} requests.`
        });
        analyticsEmitter.emit(`new_alert_${userId}`, alert);
      }
    }

    res.json(filledData);
  } catch (error) {
    next(error);
  }
};

// 🥧 GET USAGE DISTRIBUTION
export const getAnalyticsDistribution = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { days = 30 } = req.query;
    
    const projects = await Project.find({ user: userId });
    const projectIds = projects.map(p => p._id);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Status Code Distribution
    const statusDist = await Usage.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ["$statusCode", 400] }, "Success", "Error"
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusData = statusDist.map(d => ({ name: d._id, value: d.count }));
    
    // Endpoints Breakdown
    const endpointDist = await Usage.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$endpoint",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const endpointsData = endpointDist.map(d => ({ name: d._id, value: d.count }));

    res.json({ statusData, endpointsData });
  } catch (error) {
    next(error);
  }
};

// 📋 GET USAGE LOGS
export const getAnalyticsLogs = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { limit = 50 } = req.query;
    
    const projects = await Project.find({ user: userId });
    const projectIds = projects.map(p => p._id);
    
    const logs = await Usage.find({ projectId: { $in: projectIds } })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate("apiKeyId", "name maskedKey environment")
      .populate("projectId", "name")
      .lean();
      
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// 📥 EXPORT CSV

export const exportAnalyticsCsv = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { days = 30 } = req.query;
    
    const projects = await Project.find({ user: userId });
    const projectIds = projects.map(p => p._id);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await Usage.find({ 
      projectId: { $in: projectIds },
      timestamp: { $gte: startDate }
    })
      .populate("apiKeyId", "name environment")
      .populate("projectId", "name")
      .lean();

    const formattedData = logs.map(log => ({
      Timestamp: new Date(log.timestamp).toISOString(),
      Project: log.projectId?.name || "Unknown",
      "API Key": log.apiKeyId?.name || "Unknown",
      Environment: log.apiKeyId?.environment || "Unknown",
      Method: log.method,
      Endpoint: log.endpoint,
      Status: log.statusCode,
      "Latency (ms)": log.responseTime
    }));

    if (formattedData.length === 0) {
      // Return a 200 with headers but empty content/only headers instead of 404
      // This prevents the frontend from showing an error alert when there's just no data
      const emptyCsv = "Timestamp,Project,API Key,Environment,Method,Endpoint,Status,Latency (ms)\n";
      res.header("Content-Type", "text/csv");
      res.attachment(`nigris_usage_${days}d_empty.csv`);
      return res.send(emptyCsv);
    }

    try {
      const parser = new Parser();
      const csv = parser.parse(formattedData);

      res.header("Content-Type", "text/csv");
      res.attachment(`nigris_usage_${days}d.csv`);
      return res.send(csv);
    } catch (parserError) {
      console.error("CSV Parsing Error:", parserError);
      return res.status(500).json({ message: "Error generating CSV file." });
    }
  } catch (error) {
    next(error);
  }
};

// 🔴 LIVE SSE STREAM

export const getAnalyticsLive = (req, res) => {
  const userId = req.user?.userId;
  
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listeners
  const usageListener = (data) => sendEvent("usage", data);
  const alertListener = (data) => sendEvent("alert", data);

  analyticsEmitter.on(`new_usage_${userId}`, usageListener);
  analyticsEmitter.on(`new_alert_${userId}`, alertListener);

  // Keep alive ping
  const interval = setInterval(() => {
    res.write(":\n\n"); // SSE comment
  }, 30000);

  req.on("close", () => {
    analyticsEmitter.off(`new_usage_${userId}`, usageListener);
    analyticsEmitter.off(`new_alert_${userId}`, alertListener);
    clearInterval(interval);
  });
};

// 🚨 GET ALERTS

export const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

export const markAlertRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { _id: id, userId: req.user?.userId },
      { isRead: true },
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    next(error);
  }
};
