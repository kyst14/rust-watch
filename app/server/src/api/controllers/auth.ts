import express, { type Response, type NextFunction } from "express";
import type { CustomRequest } from "../../types/Request.js";

import bd from "../../database/database.js";

export const isAuthenticated: express.RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const tocken: string | undefined = req.headers.authorization?.replace("Bearer ", "");
    if (tocken) {
        const user = await bd.getUserById(parseInt(tocken), tocken);
        if (user) {
            req.user = user;
            next();
        } else {
            res.status(401);
            res.send({ success: false, message: "Unauthorized" });
        }
    } else {
        res.status(401);
        res.json({ success: false, message: "Unauthorized" });
    }
}