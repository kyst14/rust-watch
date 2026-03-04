import express from "express";

import bd from "../../database/database.js";

export const isAuthenticated: express.RequestHandler = (req, res, next) => {
    if (req.headers.authorization) {
        if (bd.tocken.check(req.headers.authorization)) {
            next();
        } else {
            res.status(401);
            res.send("Unauthorized");
        }
    } else {
        res.status(401);
        res.send("Unauthorized");
    }
}