import express from "express";
import { login, signup } from "../modules/auth/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/register", signup);

export default router;