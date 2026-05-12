import express from "express";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "./emailTemplateController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:projectId", getEmailTemplates);
router.get("/detail/:id", getEmailTemplate);
router.post("/:projectId", createEmailTemplate);
router.put("/:id", updateEmailTemplate);
router.delete("/:id", deleteEmailTemplate);

export default router;
