# AI 上镜实验室 · Render 专用版

项目结构：

```text
frontend/
  index.html
backend/
  server.js
  package.json
render.yaml
.gitignore
README.md
```

## 1. 上传 GitHub
把整个项目内容上传到一个 GitHub 仓库。

## 2. 部署后端
Render → New → Web Service → 选择 GitHub 仓库。

设置：
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment Variables：
- `OPENAI_API_KEY` = 你的 OpenAI API Key
- `OPENAI_MODEL` = `gpt-5`
- `FRONTEND_ORIGIN` = 前期可先填 `*`

部署后会得到类似：
`https://ai-photo-glow-api.onrender.com`

## 3. 把后端地址写进前端
打开 `frontend/index.html`，找到：

```js
window.RENDER_API_BASE = "";
```

改成：

```js
window.RENDER_API_BASE = "https://ai-photo-glow-api.onrender.com";
```

保存并提交 GitHub。

## 4. 部署前端
Render → New → Static Site → 选择同一个 GitHub 仓库。

设置：
- Root Directory: `frontend`
- Build Command: 留空
- Publish Directory: `.`

部署后会得到类似：
`https://ai-photo-glow-web.onrender.com`

## 5. 收紧跨域
回到后端的 Environment Variables，把：
`FRONTEND_ORIGIN`
改成你的真实前端网址。

## 6. 以后更新
改代码 → GitHub Commit/Push → Render 自动重新部署。

## 7. 后续可继续接
- Lemon Squeezy / Stripe 付款
- Google AdSense
- 登录与会员
- 免费次数限制
- AI 报告分享卡
