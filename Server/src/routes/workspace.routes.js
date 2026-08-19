import express from "express"
import { createWorkspace,getAllWorkSpaces,getbyIdWorkSpaces } from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { workspaceLimiter,workspaceMemberLimiter } from "../middlewares/rateLimit.middleware.js";
const router = express.Router();

router.post("/create",workspaceLimiter,authMiddleware, createWorkspace);
router.get("/getAll",workspaceMemberLimiter,authMiddleware,getAllWorkSpaces);
router.get("/getbyId/:id",workspaceMemberLimiter,authMiddleware,getbyIdWorkSpaces);

export default router;