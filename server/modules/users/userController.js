import asyncHandler from "../../utils/asyncHandler.js";
import User from "../../models/User.js";
import Project from "../../models/Project.js";
import ApiKey from "../../models/ApiKey.js";
import Collection from "../../models/Collection.js";
import { getPlanByName } from "../../utils/planUtils.js";
import { getPlanLimits } from "../../utils/planLimits.js";

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const plan = await getPlanByName(user.plan);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    planStatus: user.planStatus,
    planRenewsAt: user.planRenewsAt,
    razorpaySubscriptionId: user.razorpaySubscriptionId,
    subscriptionStatus: user.subscriptionStatus,
    nextBillingDate: user.nextBillingDate,
    requestLimit: plan?.requestLimit || 0,
    createdAt: user.createdAt,
  });
});

// ✏️ UPDATE PROFILE
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name: name.trim() },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "Profile updated", user });
});

// 🔐 CHANGE PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
});

// 📊 GET PLAN LIMITS + CURRENT USAGE
export const getLimits = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const limits = getPlanLimits(user.plan);

  const [projectCount, apiKeyCount, collectionCount] = await Promise.all([
    Project.countDocuments({ user: userId }),
    ApiKey.countDocuments({ user: userId }),
    Collection.countDocuments({ createdBy: userId }),
  ]);

  res.json({
    plan: user.plan,
    limits,
    usage: {
      projects: projectCount,
      apiKeys: apiKeyCount,
      collections: collectionCount,
    },
  });
});
