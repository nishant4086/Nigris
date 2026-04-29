import mongoose from "mongoose";
import ApiKey from "../../models/ApiKey.js";
import Project from "../../models/Project.js";
import User from "../../models/User.js";
import { generateApiKey } from "../../utils/generateApiKey.js";
import { ensurePlans, getPlanByName } from "../../utils/planUtils.js";


// ➕ CREATE API KEY (PLAN BASED)
export const createApiKey = async (req, res) => {
  try {
    const { projectId, name } = req.body;
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

    // 🔑 Generate API key
    const key = generateApiKey();

    // 🔥 GET USER PLAN
    await ensurePlans();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 GET PLAN DATA
    const plan = await getPlanByName(user.plan);

    if (!plan) {
      return res.status(500).json({ message: "Plan not found" });
    }

    // 📦 CREATE API KEY
    const apiKey = await ApiKey.create({
      key,
      user: userId,
      project: projectId,
      name,

      // 🔥 PLAN BASED LIMIT
      limit: plan.requestLimit,
      usage: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json(apiKey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📥 GET ALL API KEYS
export const getApiKeys = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const keys = await ApiKey.find({ user: userId })
      .populate("project", "name");

    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ❌ DELETE API KEY
export const deleteApiKey = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};


// 📊 USAGE DASHBOARD
export const getUsage = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

// ✏️ UPDATE API KEY
export const updateApiKey = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { name, isActive, rotate } = req.body || {};

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

    if (rotate) {
      key.key = generateApiKey();
      key.usage = 0;
      key.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await key.save();
    res.json(key);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 USAGE SUMMARY
export const getUsageSummary = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};