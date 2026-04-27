import ApiKey from "../../models/ApiKey.js";
import Project from "../../models/Project.js";
import Plan from "../../models/Plan.js";
import User from "../../models/User.js";
import { generateApiKey } from "../../utils/generateApiKey.js";


// ➕ CREATE API KEY (PLAN BASED)
export const createApiKey = async (req, res) => {
  try {
    const { projectId, name } = req.body;

    // ✅ Validate projectId
    if (!projectId) {
      return res.status(400).json({ message: "projectId required" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔐 Authorization
    if (project.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔑 Generate API key
    const key = generateApiKey();

    // 🔥 GET USER PLAN
    const user = await User.findById(req.user.userId);

    // 🔥 GET PLAN DATA
    const plan = await Plan.findOne({ name: user.plan });

    if (!plan) {
      return res.status(500).json({ message: "Plan not found" });
    }

    // 📦 CREATE API KEY
    const apiKey = await ApiKey.create({
      key,
      user: req.user.userId,
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
    const keys = await ApiKey.find({ user: req.user.userId })
      .populate("project", "name");

    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ❌ DELETE API KEY
export const deleteApiKey = async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }

    if (key.user.toString() !== req.user.userId.toString()) {
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
    const keys = await ApiKey.find({ user: req.user.userId })
      .populate("project", "name");

    const usageData = keys.map((key) => ({
      id: key._id,
      name: key.name,
      project: key.project?.name,
      usage: key.usage,
      limit: key.limit,
      remaining: key.limit - key.usage,
      resetAt: key.resetAt,
    }));

    res.json(usageData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};