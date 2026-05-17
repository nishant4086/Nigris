import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import ContactMessage from "../models/ContactMessage.js";
import BlogPost from "../models/BlogPost.js";
import ActivityLog from "../models/ActivityLog.js";
import SystemError from "../models/SystemError.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ==================== MESSAGES ====================

// GET /api/admin/messages
router.get("/messages", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(),
    ]);

    const unread = await ContactMessage.countDocuments({ read: false });

    res.json({ messages, total, unread, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PATCH /api/admin/messages/:id/read
router.patch("/messages/:id/read", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE /api/admin/messages/:id
router.delete("/messages/:id", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// ==================== BLOG POSTS ====================

// GET /api/admin/blogs
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await BlogPost.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// GET /api/admin/blogs/:id
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id).populate("author", "name email");
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// POST /api/admin/blogs
router.post("/blogs", async (req, res) => {
  try {
    const { title, content, excerpt, status, tags } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const blog = await BlogPost.create({
      title,
      content,
      excerpt,
      status: status || "draft",
      tags: tags || [],
      author: req.user.userId,
    });

    await ActivityLog.create({
      action: "blog_created",
      resource: "BlogPost",
      resourceId: blog._id.toString(),
      userId: req.user.userId,
      details: `Created blog: "${title}"`,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog" });
  }
});

// PUT /api/admin/blogs/:id
router.put("/blogs/:id", async (req, res) => {
  try {
    const { title, content, excerpt, status, tags } = req.body;
    const blog = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { title, content, excerpt, status, tags },
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    await ActivityLog.create({
      action: "blog_updated",
      resource: "BlogPost",
      resourceId: blog._id.toString(),
      userId: req.user.userId,
      details: `Updated blog: "${blog.title}"`,
    });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog" });
  }
});

// DELETE /api/admin/blogs/:id
router.delete("/blogs/:id", async (req, res) => {
  try {
    const blog = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    await ActivityLog.create({
      action: "blog_deleted",
      resource: "BlogPost",
      resourceId: req.params.id,
      userId: req.user.userId,
      details: `Deleted blog: "${blog.title}"`,
    });

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

// ==================== ACTIVITY LOG ====================

// GET /api/admin/activities
router.get("/activities", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ActivityLog.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(),
    ]);

    res.json({ activities, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// ==================== STATS ====================

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [messageCount, unreadCount, blogCount, publishedCount, activityCount] =
      await Promise.all([
        ContactMessage.countDocuments(),
        ContactMessage.countDocuments({ read: false }),
        BlogPost.countDocuments(),
        BlogPost.countDocuments({ status: "published" }),
        ActivityLog.countDocuments(),
      ]);

    res.json({ messageCount, unreadCount, blogCount, publishedCount, activityCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ==================== SYSTEM ERRORS ====================

// GET /api/admin/errors
router.get("/errors", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Optional filter by resolved status
    const filter = {};
    if (req.query.resolved === "true") filter.resolved = true;
    if (req.query.resolved === "false") filter.resolved = false;

    const [errors, total] = await Promise.all([
      SystemError.find(filter)
        .populate("resolvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SystemError.countDocuments(filter),
    ]);

    const unresolvedCount = await SystemError.countDocuments({ resolved: false });

    res.json({ errors, total, unresolvedCount, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch errors" });
  }
});

// PATCH /api/admin/errors/:id/resolve
router.patch("/errors/:id/resolve", async (req, res) => {
  try {
    const errorDoc = await SystemError.findByIdAndUpdate(
      req.params.id,
      { 
        resolved: true, 
        resolvedAt: new Date(),
        resolvedBy: req.user.userId 
      },
      { new: true }
    );
    if (!errorDoc) return res.status(404).json({ error: "Error not found" });
    
    await ActivityLog.create({
      action: "error_resolved",
      resource: "SystemError",
      resourceId: errorDoc._id.toString(),
      userId: req.user.userId,
      details: `Resolved error: ${errorDoc.message}`,
    });

    res.json(errorDoc);
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve error" });
  }
});

export default router;
