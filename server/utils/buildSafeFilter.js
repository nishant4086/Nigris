const buildSafeFilter = (query, collectionFields) => {
  const filter = {};
  const excludeParams = ["page", "limit", "id"];

  Object.keys(query).forEach((key) => {
    // 1. Remove operators (keys with $ or .)
    if (key.includes("$") || key.includes(".")) {
      return;
    }

    // 2. Reject object-based query values
    if (typeof query[key] === "object" && query[key] !== null) {
      return;
    }

    if (!excludeParams.includes(key)) {
      // 3. Only allow whitelisted fields
      const fieldDef = collectionFields.find((f) => f.name === key);
      if (fieldDef) {
        // 4. Cast value based on type
        let val = query[key];
        if (fieldDef.type === "number") {
          val = Number(val);
          if (isNaN(val)) return; // Ignore invalid numbers
        } else if (fieldDef.type === "boolean") {
          val = val === "true" || val === "1";
        } else {
          val = String(val); // default to string for "text"
        }
        
        filter[`data.${key}`] = val;
      }
    }
  });

  return filter;
};

export default buildSafeFilter;
