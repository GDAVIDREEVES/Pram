import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/gifs/search", async (req, res) => {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GIPHY API key not configured" });
    }
    const q = req.query.q as string;
    const offset = req.query.offset || "0";
    const limit = req.query.limit || "20";
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=g&lang=en`;
      const response = await fetch(url);
      const data = await response.json();
      const gifs = (data.data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        previewUrl: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
        url: g.images?.fixed_height?.url,
        width: parseInt(g.images?.fixed_height?.width || "200"),
        height: parseInt(g.images?.fixed_height?.height || "200"),
      }));
      res.json({ gifs });
    } catch (err) {
      console.error("GIPHY search error:", err);
      res.status(500).json({ error: "Failed to search GIFs" });
    }
  });

  app.get("/api/gifs/trending", async (req, res) => {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GIPHY API key not configured" });
    }
    const limit = req.query.limit || "20";
    try {
      const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=g`;
      const response = await fetch(url);
      const data = await response.json();
      const gifs = (data.data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        previewUrl: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
        url: g.images?.fixed_height?.url,
        width: parseInt(g.images?.fixed_height?.width || "200"),
        height: parseInt(g.images?.fixed_height?.height || "200"),
      }));
      res.json({ gifs });
    } catch (err) {
      console.error("GIPHY trending error:", err);
      res.status(500).json({ error: "Failed to get trending GIFs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
