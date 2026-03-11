import pino from "pino";
import "dotenv/config";

export const logger = !process.env.VERCEL ? pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
    }
  }
}) : pino();
