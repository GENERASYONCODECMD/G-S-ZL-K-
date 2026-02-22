import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // TDK API Proxy
  app.get("/api/tdk", async (req, res) => {
    const word = req.query.q as string;
    if (!word) {
      return res.status(400).json({ error: "Word parameter 'q' is required" });
    }

    try {
      // TDK API endpoint
      const response = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`TDK API responded with ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("TDK API Error:", error);
      res.status(500).json({ error: "Failed to fetch from TDK API" });
    }
  });

  // Generate Wallpaper Endpoint
  app.post("/api/generate-wallpaper", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    console.log("API Key present:", !!apiKey);
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `A futuristic iOS 26 concept wallpaper designed for dual Lock Screen and AOD use. The central subject is a complex, flowing sculpture made of hyper-realistic "Liquid Glass." This glass entity is viscous, highly refractive, with chromatic aberration and iridescent caustics casting subtle light patterns. It has a biomorphic, fluid shape, like mercury suspended in zero gravity.

Crucially, this liquid glass sculpture is isolated against a pure, pitch-black void background (#000000 hexadecimal). There is zero ambient light in the background; only the central glass object is illuminated by dramatic, cool-toned rim lighting.

The composition is centered, leaving substantial negative, dark space at the top for the UI clock and widgets. The overall aesthetic is minimalist luxury, ray-tracing render, 8k resolution, highly detailed macro photography, deep contrast.`;

    try {
      console.log("Generating wallpaper...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      const imagePart = parts?.find(part => part.inlineData);

      if (imagePart && imagePart.inlineData) {
        const base64Data = imagePart.inlineData.data;
        const buffer = Buffer.from(base64Data, 'base64');
        
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        const filePath = path.join(publicDir, 'lockscreen-bg.png');
        fs.writeFileSync(filePath, buffer);
        console.log(`Wallpaper saved to ${filePath}`);
        res.json({ success: true, path: '/lockscreen-bg.png' });
      } else {
        console.error("No image data found");
        res.status(500).json({ error: "No image data found" });
      }
    } catch (error) {
      console.error("Error generating wallpaper:", error);
      res.status(500).json({ error: "Generation failed", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
