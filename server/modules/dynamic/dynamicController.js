import Collection from "../../models/Collection.js";
import Data from "../../models/Data.js";
import Project from "../../models/Project.js";


// 🔐 Helper
const checkAccess = async (collection, user) => {
  const project = await Project.findById(collection.project);

  if (!project) return false;

  if (collection.isPublic) return true;

  if (!user) return false;

  return project.user.toString() === user.userId.toString();
};


// ➕ CREATE
export const createDynamic = async (req, res) => {
  try {
    const { slug } = req.params;

    const collection = await Collection.findOne({ slug });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const allowed = await checkAccess(collection, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const newData = await Data.create({
      collectionId: collection._id,
      data: req.body,
      createdBy: req.user?.userId,
    });

    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📥 GET
export const getDynamic = async (req, res) => {
  try {
    const { slug } = req.params;

    const collection = await Collection.findOne({ slug });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const allowed = await checkAccess(collection, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const data = await Data.find({
      collectionId: collection._id,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✏️ UPDATE
export const updateDynamic = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Data.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data not found" });
    }

    const collection = await Collection.findById(existing.collectionId);

    const allowed = await checkAccess(collection, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Data.findByIdAndUpdate(
      id,
      { data: req.body },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ❌ DELETE
export const deleteDynamic = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Data.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data not found" });
    }

    const collection = await Collection.findById(existing.collectionId);

    const allowed = await checkAccess(collection, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Data.findByIdAndDelete(id);

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};