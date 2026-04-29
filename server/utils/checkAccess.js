import mongoose from "mongoose";
import Collection from "../models/Collection.js";
import Project from "../models/Project.js";

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

  if (!userId || project.user.toString() !== userId.toString()) {
    return { error: "Not authorized", status: 403 };
  }

  return { collection, project };
};
