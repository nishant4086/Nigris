import connectDB from "../config/db.js";
import Usage from "../models/Usage.js";
import Project from "../models/Project.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await connectDB();
  
  const usages = await Usage.find({}).lean();
  console.log("ALL USAGES IN DB:", usages.length);
  if (usages.length > 0) {
    console.log("Sample:", usages[0]);
  }

  // Check what getUsage would do for this user
  // Let's find a user who owns a project
  const project = await Project.findOne({});
  if (!project) {
    console.log("No projects found.");
    process.exit(0);
  }
  
  const userId = project.user;
  console.log("Simulating for User:", userId);

  const projects = await Project.find({ user: userId }).select("_id");
  const projectIds = projects.map(p => p._id);
  console.log("User Projects:", projectIds);

  const matchStage = { project: { $in: projectIds } };
  console.log("Match Stage:", JSON.stringify(matchStage, null, 2));

  const totalResult = await Usage.aggregate([
    { $match: matchStage },
    { $group: { _id: null, totalRequests: { $sum: "$count" } } }
  ]);
  
  console.log("Total Result:", totalResult);
  
  process.exit(0);
}

run();
