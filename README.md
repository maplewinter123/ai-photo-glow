# AI 上镜实验室 · Render + 通义千问版

默认模型：`qwen-vl-plus`。

## 从旧 Render/OpenAI 版迁移

### GitHub 里删除或覆盖
- 删除旧 `backend/server.js`
- 删除旧 `backend/package.json`
- 删除旧 `render.yaml`
- 如果根目录还有旧 `index.html`，删除它；新版首页是 `frontend/index.html`
- 删除旧 Vercel 残留 `api/analyze.js`、`vercel.json`（如果还有）
- 不要上传任何真实 `.env`

### GitHub 里新增/覆盖
上传本压缩包解压后的全部内容：
- `frontend/index.html`
- `backend/server.js`
- `backend/package.json`
- `backend/.env.example`
- `render.yaml`
- `.gitignore`
- `README.md`

## Render 后端 Environment
先删除：
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

新增：
```text
DASHSCOPE_API_KEY = 你的阿里云百炼 API Key
QWEN_MODEL = qwen-vl-plus
DASHSCOPE_BASE_URL = https://dashscope.aliyuncs.com/compatible-mode/v1
FRONTEND_ORIGIN = *
```

前端部署完成后，把 `FRONTEND_ORIGIN` 从 `*` 改成真实前端网址。

## 前端连接后端
后端部署成功会得到类似：
`https://ai-photo-glow-qwen-api.onrender.com`

打开 `frontend/index.html`，找到：
```js
window.RENDER_API_BASE = "";
```
改成：
```js
window.RENDER_API_BASE = "https://ai-photo-glow-qwen-api.onrender.com";
```
提交到 GitHub。

## 测试
访问：`https://你的后端.onrender.com/health`
应返回 `ok: true`、provider 为 DashScope、model 为 qwen-vl-plus。

然后打开前端上传照片，点击生成千问 AI 出片报告。
