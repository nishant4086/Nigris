import Collection from "../../models/Collection.js";
import Data from "../../models/Data.js";
import Project from "../../models/Project.js";
import { validateData } from "../../utils/dataValidation.js";

const ownsProject = (project, user) =>
  Boolean(user?.userId && project.user.toString() === user.userId.toString());

const checkReadAccess = async (collection, user) => {
  const project = await Project.findById(collection.project);

  if (!project) return false;

  if (collection.isPublic) return true;

  return ownsProject(project, user);
};

const checkWriteAccess = async (collection, user) => {
  const project = await Project.findById(collection.project);

  if (!project) return false;

  return ownsProject(project, user);
};

// ➕ CREATE
export const createDynamic = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const collection = await Collection.findOne({ slug });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

      let allowed = false;
      if (req.user) {
        allowed = await checkWriteAccess(collection, req.user);
      } else if (req.project) {
        allowed = collection.project.toString() === req.project._id.toString();
      }
      if (!allowed) {
        return res.status(403).json({ message: "Not allowed" });
      }

    const errors = await validateData(collection, req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const newData = await Data.create({
      collectionId: collection._id,
      project: collection.project,
      data: req.body,
      createdBy: req.user?.userId || req.apiKey?.user,
    });

    res.status(201).json(newData);
  } catch (error) {
    next(error);
  }
};


// 📥 GET
export const getDynamic = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const collection = await Collection.findOne({ slug });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    let allowed = false;
    if (req.user) {
      allowed = await checkReadAccess(collection, req.user);
    } else if (req.project) {
      allowed = collection.project.toString() === req.project._id.toString();
    }
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const data = await Data.find({
      collectionId: collection._id,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};


// ✏️ UPDATE
export const updateDynamic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await Data.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data not found" });
    }

    const collection = await Collection.findById(existing.collectionId);

    let allowed = false;
    if (req.user) {
      allowed = await checkWriteAccess(collection, req.user);
    } else if (req.project) {
      allowed = collection.project.toString() === req.project._id.toString();
    }
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // deep merge
    const mergedData = { ...existing.data, ...req.body };

    const errors = await validateData(collection, mergedData, id);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updated = await Data.findByIdAndUpdate(
      id,
      { data: mergedData },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
};


// ❌ DELETE
export const deleteDynamic = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await Data.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data not found" });
    }

    const collection = await Collection.findById(existing.collectionId);

    let allowed = false;
    if (req.user) {
      allowed = await checkWriteAccess(collection, req.user);
    } else if (req.project) {
      allowed = collection.project.toString() === req.project._id.toString();
    }
    
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Data.findByIdAndDelete(id);

    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};
