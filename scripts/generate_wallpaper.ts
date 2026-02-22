import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function generateWallpaper() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY or API_KEY is not set.");
    process.exit(1);
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
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: "9:16",
        }
      }
    });

    // The response structure for image generation might be different or contain inlineData
    // For gemini-2.5-flash-image, it returns inlineData in parts.
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
    } else {
      console.error("No image data found in response.");
      if (parts?.[0]?.text) {
          console.log("Text response:", parts[0].text);
      }
    }
  } catch (error) {
    console.error("Error generating wallpaper:", error);
  }
}

generateWallpaper();
