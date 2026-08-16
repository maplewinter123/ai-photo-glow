import express from "express";
import cors from "cors";

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({
  origin: frontendOrigin === "*" ? true : frontendOrigin,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "12mb" }));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "AI 上镜实验室 Render API" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { image } = req.body || {};
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Missing or invalid image" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5",
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: `你是“AI 上镜实验室”的摄影顾问。只评价照片呈现效果，不推断敏感身份属性，不把人的外貌当成人格、价值或能力。
只输出严格 JSON：
{
  "score": 0-100,
  "metrics": {
    "clarity": 0-100,
    "lighting": 0-100,
    "composition": 0-100,
    "camera": 0-100
  },
  "description": "一句中文、积极、不过度绝对化的照片总结",
  "insight": "一句中文、具体、可执行的拍摄改进建议"
}
评分重点：清晰度、光线、构图、镜头表现、整体照片呈现。`
            },
            { type: "input_image", image_url: image, detail: "high" }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const raw = await response.json();
    let text = raw.output_text || "";
    if (!text && Array.isArray(raw.output)) {
      for (const item of raw.output) {
        for (const c of (item.content || [])) {
          if (c.type === "output_text" && c.text) {
            text = c.text;
            break;
          }
        }
        if (text) break;
      }
    }

    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: "AI returned invalid JSON" });

    const data = JSON.parse(match[0]);
    const clamp = n => Math.max(0, Math.min(100, Number(n) || 0));

    return res.json({
      score: clamp(data.score),
      metrics: [
        clamp(data.metrics?.clarity),
        clamp(data.metrics?.lighting),
        clamp(data.metrics?.composition),
        clamp(data.metrics?.camera)
      ],
      description: String(data.description || ""),
      insight: String(data.insight || "")
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Unknown server error" });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`AI Photo Glow API listening on ${port}`);
});
