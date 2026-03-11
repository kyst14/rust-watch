import express, { type Response } from "express";
import cors from "cors";
import { router } from "./api/router.js";
import { webhookCallback } from "grammy";
import "dotenv/config";

import type { CustomRequest } from "./types/Request.js";
import { bot, startBot } from "../bot/bot.js";

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST: string = process.env.HOST ? process.env.HOST : "localhost";

const app: express.Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api", router);

if (process.env.WEBHOOK_URL) {
    app.all("/webhook", webhookCallback(bot, "express"));
}

app.use((req: CustomRequest, res: Response) => {
    if (req.headers["content-type"]?.includes("application/json")) {
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

function printServerInfo (): void {
    if (process.env.NODE_ENV === "production") {
        console.log(`Server is running ✅`);
    } else {
        console.clear()
        console.log(
            "⭐️ WELCOME TO THE RUST WATCH SERVER ⭐️ \n".padStart(
                process.stdout.columns/2,
                " "
            )
        );
    }
}

if (!process.env.VERCEL) {
    app.listen(PORT, HOST, async () => {
        await startBot();
        printServerInfo();
    });
}

export default app;