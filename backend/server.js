import express from "express";
import cors from "cors";

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: frontendOrigin === "*" ? true : frontendOrigin, methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "12mb" }));

app.get("/", (_req,res)=>res.json({ok:true,service:"AI 上镜实验室 · 通义千问 Render API",model:process.env.QWEN_MODEL||"qwen-vl-plus"}));
app.get("/health", (_req,res)=>res.json({ok:true,provider:"Alibaba Cloud Model Studio / DashScope",model:process.env.QWEN_MODEL||"qwen-vl-plus",time:new Date().toISOString()}));

app.post("/api/analyze", async (req,res)=>{
  try {
    const { image } = req.body || {};
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) return res.status(400).json({error:"Missing or invalid image"});
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) return res.status(500).json({error:"DASHSCOPE_API_KEY is not configured"});
    const model = process.env.QWEN_MODEL || "qwen-vl-plus";
    const baseUrl = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
    const prompt = `你是“AI 上镜实验室”的专业摄影顾问。只评价这张照片的呈现效果，不评价一个人的固定颜值，不推断敏感身份属性，也不要把外貌与人格、能力、价值挂钩。请从清晰度、光线氛围、构图平衡、镜头感四个维度分析。只返回合法 JSON，不要 Markdown：{"score":0,"metrics":{"clarity":0,"lighting":0,"composition":0,"camera":0},"description":"一句自然积极的中文总结","insight":"1到2句具体可执行的拍摄建议"}`;
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
      body:JSON.stringify({
        model,
        messages:[{role:"user",content:[
          {type:"image_url",image_url:{url:image},max_pixels:1310720},
          {type:"text",text:prompt}
        ]}],
        temperature:0.3
      })
    });
    if (!response.ok) { const detail = await response.text(); return res.status(response.status).json({error:"Qwen API request failed",detail}); }
    const raw = await response.json();
    const text = raw?.choices?.[0]?.message?.content || "";
    let data;
    try { data = JSON.parse(text); } catch { const m=String(text).match(/\{[\s\S]*\}/); if(!m) return res.status(502).json({error:"Qwen returned invalid JSON"}); data=JSON.parse(m[0]); }
    const clamp=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
    return res.json({score:clamp(data.score),metrics:[clamp(data.metrics?.clarity),clamp(data.metrics?.lighting),clamp(data.metrics?.composition),clamp(data.metrics?.camera)],description:String(data.description||"这张照片整体呈现自然、舒服。"),insight:String(data.insight||"可以尝试更柔和的自然光，并微调拍摄角度。"),provider:"qwen",model});
  } catch(err) { return res.status(500).json({error:err?.message||"Unknown server error"}); }
});

const port = process.env.PORT || 10000;
app.listen(port,"0.0.0.0",()=>console.log(`AI Photo Glow Qwen API listening on ${port}`));
