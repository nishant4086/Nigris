import Alert from "../models/Alert.js";
import { analyticsEmitter } from "./analyticsEmitter.js";

/**
 * Creates a notification for a user and emits it via SSE
 * @param {string} userId - ID of the user
 * @param {string} type - Type of notification (system, project, billing, plan, community)
 * @param {string} message - Notification message
 * @param {string} [projectId] - Optional project ID related to the notification
 */
export const createNotification = async (userId, type, message, projectId = null) => {
  try {
    const alert = await Alert.create({
      userId,
      type,
      message,
      projectId,
      isRead: false
    });

    // Emit via analyticsEmitter for live SSE updates
    analyticsEmitter.emit(`new_alert_${userId}`, alert);
    
    return alert;
  } catch (error) {
    console.error("[NotificationError] Failed to create notification:", error);
    return null;
  }
};

/**
 * Sends a notification to all users (Community Updates)
 */
export const createBroadcastNotification = async (type, message) => {
  try {
    const User = (await import("../models/User.js")).default;
    const users = await User.find({}).select("_id");
    
    const promises = users.map(user => createNotification(user._id, type, message));
    await Promise.all(promises);
    
    return true;
  } catch (error) {
    console.error("[NotificationError] Failed to broadcast notification:", error);
    return false;
  }
};
