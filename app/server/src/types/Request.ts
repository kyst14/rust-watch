import type { Request } from "express";

import type { User } from "../database/database.js";

export interface CustomRequest extends Request {
    user?: User;
}