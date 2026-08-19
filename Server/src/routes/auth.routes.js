import express from "express";
const router = express.Router();
import { register,login,getMe } from "../controllers/auth.controller.js";
import { registerValidation,loginValidation } from "../validations/auth.validation.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
router.post("/register",authLimiter,registerValidation,validate,register);
router.post("/login",authLimiter,loginValidation,validate,login)
router.get("/me",authMiddleware,getMe);

export default router;