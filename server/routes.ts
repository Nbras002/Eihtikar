import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupWebSocket } from "./websocket";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup WebSocket server
  setupWebSocket(httpServer);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  return httpServer;
}
