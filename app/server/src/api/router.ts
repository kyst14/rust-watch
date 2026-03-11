import { Router, type Response } from "express";
import "dotenv/config";

import type { CustomRequest } from "../types/Request.js";
import { isAuthenticated } from "./controllers/auth.js";

export const router: Router = Router();

router.use("/auth", isAuthenticated);

router.use((req: CustomRequest, res: Response) => {
    res.status(404).json({ success: false, message: "API endpoint not found. See https://github.com/kyst14/rust-watch#api" });
});

export default router;