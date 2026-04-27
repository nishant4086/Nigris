import Data from "../../models/Data.js";
import Collection from "../../models/Collection.js";
import { checkCollectionAccess } from "../../utils/checkAccess.js";




// ➕ CREATE DATA
export const createData = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const inputData = req.body;

    // 🔐 Access check
    const access = await checkCollectionAccess(collectionId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const collection = access.collection;

    // 🔥 Required field validation
    for (let field of collection.fields) {
      if (field.required && inputData[field.name] === undefined) {
        return res
          .status(400)
          .json({ message: `${field.name} is required` });
      }
    }

    const newData = await Data.create({
      collection: collectionId,
      data: inputData,
      createdBy: req.user._id,
    });

    res.status(201).json(newData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// 📥 GET DATA (with filter + security)
export const getData = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const filters = req.query;

    // 🔐 Access check
    const access = await checkCollectionAccess(collectionId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    let query = { collection: collectionId };

    // 🔎 Apply dynamic filters
    if (Object.keys(filters).length > 0) {
      const dynamicFilters = {};

      for (let key in filters) {
        dynamicFilters[`data.${key}`] = filters[key];
      }

      query = {
        collection: collectionId,
        ...dynamicFilters,
      };
    }

    const allData = await Data.find(query);

    res.json(allData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✏️ UPDATE DATA
export const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await Data.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Data not found" });
    }

    // 🔐 Access check
    const access = await checkCollectionAccess(
      existing.collection,
      req.user._id
    );

    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    const collection = access.collection;

    // 🔥 Required field validation after update
    for (let field of collection.fields) {
      if (field.required) {
        const valueAfterUpdate =
          updates[field.name] !== undefined
            ? updates[field.name]
            : existing.data[field.name];

        if (valueAfterUpdate === undefined) {
          return res
            .status(400)
            .json({ message: `${field.name} is required` });
        }
      }
    }

    const updatedData = await Data.findByIdAndUpdate(
      id,
      {
        data: {
          ...existing.data,
          ...updates,
        },
      },
      { new: true }
    );

    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ❌ DELETE DATA
export const deleteData = async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    // 🔐 Access check
    const access = await checkCollectionAccess(
      data.collection,
      req.user._id
    );

    if (access.error) {
      return res.status(access.status).json({ message: access.error });
    }

    await data.deleteOne();

    res.json({ message: "Data deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};