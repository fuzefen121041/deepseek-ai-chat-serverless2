# DeepSeek Serverless Backend

这是一个连接 DeepSeek API 的 Serverless 后端服务。

## 功能特性

- 🚀 基于 Vercel Serverless Functions
- 🤖 集成 DeepSeek AI API
- 🔄 支持对话历史
- 🌐 CORS 跨域支持
- ⚡ 快速部署

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的 DeepSeek API 密钥：

```
DEEPSEEK_API_KEY=你的API密钥
```

> 💡 在 [DeepSeek 平台](https://platform.deepseek.com/) 获取 API 密钥

### 3. 启动开发服务器

```bash
npm run dev
```

服务将运行在 `http://localhost:3000`

## API 使用

### POST /api/chat

发送消息给 DeepSeek AI

**请求体：**

```json
{
  "message": "你好，请介绍一下你自己",
  "conversationHistory": [
    {
      "role": "user",
      "content": "之前的消息"
    },
    {
      "role": "assistant",
      "content": "之前的回复"
    }
  ]
}
```

**响应：**

```json
{
  "success": true,
  "message": "AI 的回复内容",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## 部署

本项目支持两种部署方式：

### 方式一：部署到 Cloudflare Workers（推荐）

Cloudflare Workers 提供更好的性能和免费额度。

详细步骤请查看：**[Cloudflare 部署指南](./CLOUDFLARE_DEPLOY.md)**

快速开始：

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
npx wrangler login

# 3. 设置 API 密钥
npx wrangler secret put DEEPSEEK_API_KEY

# 4. 部署
npm run cf:deploy
```

### 方式二：部署到 Vercel

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署

```bash
vercel --prod
```

#### 4. 配置环境变量

在 Vercel 项目设置中添加环境变量：
- `DEEPSEEK_API_KEY`: 你的 DeepSeek API 密钥

## 技术栈

- Node.js
- Vercel Serverless Functions
- Axios (HTTP 客户端)
- DeepSeek API
