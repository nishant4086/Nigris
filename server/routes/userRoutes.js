import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMe, updateProfile, changePassword, getLimits } from "../modules/users/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.post("/me/password", authMiddleware, changePassword);
router.get("/me/limits", authMiddleware, getLimits);

export default router;
