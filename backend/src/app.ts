import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/index.js";

export const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Baseline health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});
