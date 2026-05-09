import mongoose from "mongoose";
import Collection from "../models/Collection.js";
import Project from "../models/Project.js";
import ProjectUser from "../models/ProjectUser.js";

export const checkCollectionAccess = async (collectionId, userId) => {
  if (!collectionId) {
    return { error: "Collection id required", status: 400 };
  }

  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    return { error: "Invalid collection id", status: 400 };
  }

  const collection = await Collection.findById(collectionId);
  if (!collection) {
    return { error: "Collection not found", status: 404 };
  }

  const project = await Project.findById(collection.project);
  if (!project) {
    return { error: "Project not found", status: 404 };
  }

  if (!userId) {
    return { error: "Not authorized", status: 403 };
  }

  // Check if user is project member with accepted status
  const membership = await ProjectUser.findOne({ project: collection.project, user: userId, status: "accepted" });
  if (!membership) {
    return { error: "Not authorized", status: 403 };
  }

  return { collection, project };
};
