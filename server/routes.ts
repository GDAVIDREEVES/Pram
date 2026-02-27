import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { scrapeWriggleClasses } from "./scraper";

interface ClassCache {
  classes: unknown[];
  lastFetchedAt: number;
}

let classCache: ClassCache | null = null;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

async function getClasses(): Promise<unknown[]> {
  const now = Date.now();
  if (classCache && (now - classCache.lastFetchedAt) < SIX_HOURS_MS) {
    return classCache.classes;
  }
  try {
    const classes = await scrapeWriggleClasses();
    classCache = { classes, lastFetchedAt: now };
    return classes;
  } catch (err) {
    console.error("[classes] Scrape failed:", err);
    return classCache?.classes ?? [];
  }
}

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

  // Classes endpoints
  app.get("/api/classes", async (_req, res) => {
    try {
      const classes = await getClasses();
      res.json({ classes, count: classes.length, cachedAt: classCache?.lastFetchedAt });
    } catch (err) {
      console.error("Classes fetch error:", err);
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes/sync", async (_req, res) => {
    try {
      classCache = null; // Force re-scrape
      const classes = await getClasses();
      res.json({ classes, count: classes.length, syncedAt: classCache?.lastFetchedAt });
    } catch (err) {
      console.error("Classes sync error:", err);
      res.status(500).json({ error: "Failed to sync classes" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
