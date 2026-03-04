import express from "express";
import { router } from "./api/router.js";
import os, { type NetworkInterfaceInfo } from "os";
import "dotenv/config";

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST: string = process.env.HOST ? process.env.HOST : "localhost";

const app = express();

app.use("/api", router);

app.get("/", (req, res) => {
    res.send("The server is running!");
});

app.listen(PORT, HOST, () => {
    if (process.env.NODE_ENV === "production") {
        console.log(`Server is running ✅`);
    } else {
        const networkInterfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = os.networkInterfaces();
        const addresses: string[] = [];
        
        addresses.push("localhost");

        if (HOST === "0.0.0.0") {
            addresses.push(os.hostname());
            for (const networkInterface of Object.values(networkInterfaces)) {
                if (!networkInterface) continue;
                for (const address of networkInterface) {
                    if (address.family === "IPv4" && !address.internal) {
                        addresses.push(address.address);
                    }
                }
            }
        }

        console.log("WELCOME TO THE DEVELOPMENT SERVER");

        console.log("Available addresses:");

        addresses.forEach((address) => {
            console.log(`Server is running at http://${address}:${PORT}`);
        });
    }
});