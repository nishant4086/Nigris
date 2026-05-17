import Collection from "../../models/Collection.js";
import Project from "../../models/Project.js";
import asyncHandler from "../../utils/asyncHandler.js";

// Helper to map Nigris types to TypeScript types
const getTsType = (type) => {
  switch (type) {
    case "number": return "number";
    case "boolean": return "boolean";
    case "reference": return "string"; // Usually ObjectIds are strings in JSON
    default: return "string"; // text, image, video, file
  }
};

// 📦 GET /api/sdk/types/:projectId
export const generateTypeScriptDefinitions = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate Project
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Fetch all collections for the project
  const collections = await Collection.find({ project: projectId });

  let dtsOutput = `// Auto-generated Nigris SDK Types for Project: ${project.name}\n// Generated at: ${new Date().toISOString()}\n\n`;

  collections.forEach((col) => {
    // Generate interface name (e.g., "blog_posts" -> "BlogPosts")
    const interfaceName = col.slug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    dtsOutput += `export interface ${interfaceName} {\n`;
    dtsOutput += `  _id: string;\n`;

    col.fields.forEach((field) => {
      const tsType = getTsType(field.type);
      const optionalFlag = field.required ? "" : "?";
      dtsOutput += `  ${field.name}${optionalFlag}: ${tsType};\n`;
    });

    dtsOutput += `  createdAt: string;\n`;
    dtsOutput += `  updatedAt: string;\n`;
    dtsOutput += `}\n\n`;
  });

  dtsOutput += `// Utility type for generic API responses
export interface NigrisResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
`;

  // Set response headers for download
  res.setHeader('Content-Type', 'text/typescript');
  res.setHeader('Content-Disposition', `attachment; filename="nigris-types-${project._id}.d.ts"`);
  res.send(dtsOutput);
});
