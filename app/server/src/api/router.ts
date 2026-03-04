import { Router } from "express";
import "dotenv/config";

import { isAuthenticated } from "./controllers/auth.js";

export const router: Router = Router();

router.get("/", (req, res) => {
    if (req.headers["content-type"] !== "application/json" || req.headers["user-agent"]) {
        res.send(`See https://github.com/kyst14/rust-watch#api for more information about the API. <br><br>rust-watch v${process.env.npm_package_version}`);
    } else {
        res.json({
            "name": "rust-watch",
            "version": process.env.npm_package_version,
            "author": "kyst14",
            "repository": "https://github.com/kyst14/rust-watch",
            "documentation": "https://github.com/kyst14/rust-watch#api"
        });
        return;
    }
});

router.use("/auth", isAuthenticated);

export default router;