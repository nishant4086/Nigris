import asyncHandler from "../../utils/asyncHandler.js";
import User from "../../models/User.js";
import { getPlanByName } from "../../utils/planUtils.js";

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
    plan: user.plan,
    planStatus: user.planStatus,
    planRenewsAt: user.planRenewsAt,
    requestLimit: plan?.requestLimit || 0,
  });
});
