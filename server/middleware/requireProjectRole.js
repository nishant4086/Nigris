import ProjectUser from "../models/ProjectUser.js";
import { hasPermission } from "../utils/permissions.js";

/**
 * Middleware factory: checks if the current user has the required
 * permission on the project specified by `req.params.id` (or `req.params.projectId`).
 *
 * Usage:  router.delete("/:id", requireProjectRole("project.delete"), deleteProject);
 */
const requireProjectRole = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const projectId = req.params.id || req.params.projectId || req.body.projectId;

      if (!userId || !projectId) {
        return res.status(401).json({ error: "Unauthorized or missing projectId" });
      }

      const membership = await ProjectUser.findOne({
        project: projectId,
        user: userId,
        status: "accepted",
      });

      if (!membership) {
        return res
          .status(403)
          .json({ error: "You are not a member of this project." });
      }

      if (!hasPermission(membership.role, action)) {
        return res
          .status(403)
          .json({ error: `Insufficient permissions. Requires: ${action}` });
      }

      // Attach membership to request for downstream use
      req.projectRole = membership.role;
      req.projectMembership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default requireProjectRole;
