import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
// Support parsing larger JSON/base64 payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Initialize Gemini client with proper user-agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Endpoint for Outfit Analysis
app.post("/api/analyze-ootd", async (req, res): Promise<any> => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data in request" });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    // Extract base64 mime type if possible, default to image/jpeg
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptText = `
      You are an expert personal wardrobe stylist and fashion visual intelligence system.
      Analyze this Outfit of the Day (OOTD) image.
      
      Extract and detail the following properties precisely:
      1. Top garments (type e.g. T恤, 衬衫, etc., color description, and stylistic detail)
      2. Bottom garments (type e.g. 牛仔裤, A字裙, etc., color description, and silhouette/detail)
      3. Hair features (style description, color)
      4. Handheld/worn accessories such as bags, necklaces, hats, belts, sunglasses (provide up to 3 accessories, specifying type, color, and descriptive detail for each)
      5. Shoes (type e.g. 运动鞋, 帆布鞋, 单鞋 etc., color, and detail)
      6. Target scenarios or scenes appropriate for this look (list 1-4 standard scenes like "休闲", "约会", "通勤", "运动", "派对", "户外")
      7. Suitable weather condition (e.g. "晴", "多云", "阴", "凉爽") and reasonable average temperature integer in Celsius (e.g. 26) suitable for this outfit thickness
      8. A fitting emoji representing the style vibe (e.g. 😊, 🧸, 🌟, 😎, ✨, 🎨)
      9. Concise professional styling commentary/advice (2-3 short sentences written in professional, elegant, modern Chinese).
      
      Ensure your tags are returned in Chinese as described to match standard local terminology.
    `;

    const textPart = {
      text: promptText,
    };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.OBJECT,
          properties: {
            top: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Type of top, e.g. T恤, 衬衫, 毛衣, 吊带" },
                color: { type: Type.STRING, description: "Color of top, e.g. 白色, 经典黑, 燕麦色" },
                detail: { type: Type.STRING, description: "Detail style of top, e.g. 圆领短袖, 法式方领, 宽松设计" },
              },
              required: ["type", "color", "detail"],
            },
            bottom: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Type of bottom, e.g. 牛仔裤, 工装裤, 半身裙, 短裤" },
                color: { type: Type.STRING, description: "Color of bottom, e.g. 浅蓝, 碳灰, 奶白色" },
                detail: { type: Type.STRING, description: "Detail style of bottom, e.g. 经典直筒, A字裙设计, 高腰垂坠" },
              },
              required: ["type", "color", "detail"],
            },
            hair: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING, description: "Hair style, e.g. 披肩发, 高马尾, 法式微卷, 中分短发" },
                color: { type: Type.STRING, description: "Hair color, e.g. 黑色, 焦糖棕, 亚麻灰" },
              },
              required: ["style", "color"],
            },
            accessories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Type of accessory, e.g. 项链, 包, 棒球帽, 墨镜, 耳环" },
                  color: { type: Type.STRING, description: "Color, e.g. 银色, 奶茶棕, 黑色" },
                  detail: { type: Type.STRING, description: "Detail, e.g. 18K锁骨链, 复古皮革腋下包, 极简金属框架" },
                },
                required: ["type", "color", "detail"],
              },
            },
            shoes: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Type of shoes, e.g. 运动鞋, 德训鞋, 帆布鞋, 复古玛丽珍, 马丁靴" },
                color: { type: Type.STRING, description: "Color of shoes, e.g. 纯白, 复古白, 哑光黑" },
                detail: { type: Type.STRING, description: "Shoes retail, e.g. 厚底舒适设计, 拼色解构, 复古皮搭扣" },
              },
              required: ["type", "color", "detail"],
            },
          },
          required: ["top", "bottom", "hair", "accessories", "shoes"],
        },
        scenes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of suitable scenes, e.g. ['休闲', '约会']",
        },
        weather: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING, description: "Weather pattern, e.g. 晴, 多云, 凉爽" },
            temp: { type: Type.INTEGER, description: "Perfect average Celsius temperature, e.g. 28" },
          },
          required: ["condition", "temp"],
        },
        mood: {
          type: Type.STRING,
          description: "Representative emoji, e.g. 😊, 🧸, 🧸, 😎, ✨",
        },
        stylingAdvice: {
          type: Type.STRING,
          description: "One paragraph styling commentary/advice on fashion elements (Chinese, 2-3 sentences)",
        },
      },
      required: ["items", "scenes", "weather", "mood", "stylingAdvice"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const textOutput = response.text?.trim() || "{}";
    const result = JSON.parse(textOutput);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini OOTD analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze outfit image" });
  }
});

// API Endpoint for Social Media Trend Optimization Recommendations
app.post("/api/optimize-ootd", async (req, res): Promise<any> => {
  try {
    const { items, imageBase64, styleTarget } = req.body;
    
    const itemsDescription = JSON.stringify(items);
    
    const promptText = `
      You are an elite Gen-Z social media fashion influencer and professional stylist on RED / Instagram (小红书/Instagram 顶级穿搭博主).
      
      We have an outfit with the following component details:
      \${itemsDescription}
      
      The user is aiming for this vibe or targeting this selected fashion trend: "\${styleTarget || "Ins 流行多巴胺/CleanFit风格"}".
      
      Analyze this look relative to current hot social media fashion trends (e.g. dopamine high-color, clean fit, balletcore, retro ivy, old money, espresso brown/latte style) on Xiaohongshu (小红书), TikTok and Instagram.
      
      Provide tailored, highly actionable optimization advice across:
      1. **trendVibe**: Which trend style this outfits corresponds or can pivot to (e.g., "多巴胺糖果元气风", "Clean Fit高智极简风", "常春藤美式学院风", "慵懒拿铁松弛风", "芭蕾少女风/Balletcore"). Limit to 8 words.
      2. **colorAdvice**: Exact color combination matching optimizations (色彩搭配优化). Tell them how to mix colors better, what accent color to introduce (e.g. adding high-saturation hot pink or neutralizing with milky white) to make it more cohesive. (Written in professional, trendy Chinese, 2 max sentences)
      3. **shoeAdvice**: Footwear alternatives or optimizations (可以搭配的鞋靴建议). Suggest specific shoes to replace or style it with (e.g., retro Mary Jane shoes with white socks, Asics metallic runners, Adidas Samba) to amplify the aesthetic. (Written in Chinese, 2 max sentences)
      4. **accAdvice**: Accessories additions and color specs (适合什么颜色与材质的配饰). Detail what silver/gold jewelry, glasses, hair bows, or designer leather bags in what precise hues would elevate it from standard to influencer-level. (Written in Chinese, 2 max sentences)
      5. **trendScore**: Numeric score from 65 to 99 assessing overall photogenic potential / social media index on Instagram.
      6. **hashtags**: 4-5 high-traffic trending fashion hashtags (e.g., #每日穿搭, #多巴胺女孩, #夏日不重样, #Cleanfit, #度假穿搭) in Chinese.
    `;

    const contents: any[] = [];
    if (imageBase64 && !imageBase64.startsWith("gradient-") && imageBase64.length > 50) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
    contents.push({ text: promptText });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        trendVibe: { type: Type.STRING, description: "Chinese trend vibe name, e.g. 多巴胺少女高彩风" },
        colorAdvice: { type: Type.STRING, description: "Detailed color pairing advice in Chinese" },
        shoeAdvice: { type: Type.STRING, description: "Footwear optimization advice in Chinese" },
        accAdvice: { type: Type.STRING, description: "Accessorizing optimization advice in Chinese" },
        trendScore: { type: Type.INTEGER, description: "Match score out of 100" },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "4-5 social trends hashtags with #"
        }
      },
      required: ["trendVibe", "colorAdvice", "shoeAdvice", "accAdvice", "trendScore", "hashtags"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Gemini OOTD Trend Optimization Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze trends for outfit" });
  }
});

// Setup dev server with Vite proxy and static production delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OOTD Server] Up and running on http://localhost:${PORT}`);
  });
}

startServer();
