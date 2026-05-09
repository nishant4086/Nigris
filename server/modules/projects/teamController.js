import jwt from "jsonwebtoken";
import ProjectUser from "../../models/ProjectUser.js";
import User from "../../models/User.js";
import Project from "../../models/Project.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getRoleLevel } from "../../utils/permissions.js";
import { sendInviteEmail } from "../../utils/inviteEmail.js";

// ➕ INVITE USER
export const inviteUser = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const inviterId = req.user?.userId;
  const { email, role } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!["admin", "editor", "viewer"].includes(role)) {
    return res.status(400).json({ error: "Role must be admin, editor, or viewer" });
  }

  // Only owner can assign admin
  if (role === "admin" && req.projectRole !== "owner") {
    return res.status(403).json({ error: "Only the project owner can assign admin role" });
  }

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  // Look up the user by email
  const targetUser = await User.findOne({ email: email.toLowerCase() });

  if (targetUser) {
    // Prevent self-invite
    if (targetUser._id.toString() === inviterId.toString()) {
      return res.status(400).json({ error: "You cannot invite yourself" });
    }

    // Check if already a member
    const existing = await ProjectUser.findOne({ project: projectId, user: targetUser._id });
    if (existing) {
      return res.status(409).json({ error: "User is already a member of this project" });
    }

    const membership = await ProjectUser.create({
      project: projectId,
      user: targetUser._id,
      role,
      invitedBy: inviterId,
      status: "pending",
      inviteEmail: email.toLowerCase(),
    });

    // Generate Invite Link
    const token = jwt.sign(
      { membershipId: membership._id, projectId, email: email.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/invites/accept?token=${token}`;

    // Send Email
    const inviter = await User.findById(inviterId);
    await sendInviteEmail({
      to: email.toLowerCase(),
      projectName: project.name,
      inviterName: inviter?.name || "A colleague",
      inviteLink,
    }).catch(console.error);

    return res.status(201).json(membership);
  }

  // User doesn't exist yet — create a pending invite by email
  const existingInvite = await ProjectUser.findOne({ project: projectId, inviteEmail: email.toLowerCase() });
  if (existingInvite) {
    return res.status(409).json({ error: "An invite for this email already exists" });
  }

  const membership = await ProjectUser.create({
    project: projectId,
    role,
    invitedBy: inviterId,
    status: "pending",
    inviteEmail: email.toLowerCase(),
  });

  // Generate Invite Link for non-existent user
  const token = jwt.sign(
    { membershipId: membership._id, projectId, email: email.toLowerCase() },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?token=${token}`;

  const inviter = await User.findById(inviterId);
  await sendInviteEmail({
    to: email.toLowerCase(),
    projectName: project.name,
    inviterName: inviter?.name || "A colleague",
    inviteLink,
  }).catch(console.error);

  res.status(201).json(membership);
});

// ✅ ACCEPT INVITE
export const acceptInvite = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user?.userId;

  const membership = await ProjectUser.findOne({
    project: projectId,
    user: userId,
    status: "pending",
  });

  if (!membership) {
    return res.status(404).json({ error: "No pending invite found" });
  }

  membership.status = "accepted";
  await membership.save();

  res.json({ message: "Invite accepted", membership });
});

// 🔗 ACCEPT INVITE BY TOKEN (EMAIL LINK)
export const acceptInviteByToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { membershipId, projectId, email } = decoded;

    const userId = req.user?.userId;
    const user = await User.findById(userId);

    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: "This invite was sent to a different email address" });
    }

    const membership = await ProjectUser.findOne({
      _id: membershipId,
      project: projectId,
      status: "pending",
    });

    if (!membership) {
      return res.status(404).json({ error: "Invite not found or already accepted" });
    }

    membership.user = userId;
    membership.status = "accepted";
    await membership.save();

    res.json({ message: "Welcome to the project!", projectId });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired invite token" });
  }
});

// 📋 LIST PROJECT MEMBERS
export const listMembers = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  const members = await ProjectUser.find({ project: projectId })
    .populate("user", "name email")
    .populate("invitedBy", "name")
    .sort({ createdAt: 1 });

  const formatted = members.map((m) => ({
    _id: m._id,
    userId: m.user?._id || null,
    name: m.user?.name || m.inviteEmail,
    email: m.user?.email || m.inviteEmail,
    role: m.role,
    status: m.status,
    invitedBy: m.invitedBy?.name || null,
    joinedAt: m.status === "accepted" ? m.updatedAt : null,
  }));

  res.json(formatted);
});

// ✏️ CHANGE ROLE
export const changeRole = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const targetUserId = req.params.userId;
  const currentUserId = req.user?.userId;
  const { role } = req.body;

  if (!["admin", "editor", "viewer"].includes(role)) {
    return res.status(400).json({ error: "Role must be admin, editor, or viewer" });
  }

  const membership = await ProjectUser.findOne({
    project: projectId,
    user: targetUserId,
  });

  if (!membership) {
    return res.status(404).json({ error: "Member not found" });
  }

  // Cannot change owner's role
  if (membership.role === "owner") {
    return res.status(403).json({ error: "Cannot change the project owner's role" });
  }

  // Cannot escalate to a role higher than your own
  const myLevel = getRoleLevel(req.projectRole);
  const newLevel = getRoleLevel(role);
  if (newLevel >= myLevel && req.projectRole !== "owner") {
    return res.status(403).json({ error: "Cannot assign a role equal to or above your own" });
  }

  membership.role = role;
  await membership.save();

  res.json({ message: "Role updated", membership });
});

// 🗑️ REMOVE USER
export const removeMember = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const targetUserId = req.params.userId;
  const currentUserId = req.user?.userId;

  const membership = await ProjectUser.findOne({
    project: projectId,
    user: targetUserId,
  });

  if (!membership) {
    return res.status(404).json({ error: "Member not found" });
  }

  // Cannot remove the owner
  if (membership.role === "owner") {
    return res.status(403).json({ error: "Cannot remove the project owner" });
  }

  // Cannot remove yourself if you're the only admin
  if (targetUserId === currentUserId) {
    return res.status(403).json({ error: "You cannot remove yourself. Leave the project instead." });
  }

  await membership.deleteOne();
  res.json({ message: "Member removed" });
});

// 📨 GET MY PENDING INVITES
export const getMyInvites = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  const invites = await ProjectUser.find({ user: userId, status: "pending" })
    .populate("project", "name description")
    .populate("invitedBy", "name");

  res.json(invites);
});
