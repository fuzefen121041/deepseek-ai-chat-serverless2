# Cloudflare Workers 部署指南

本指南将帮助你将 DeepSeek Chat API 部署到 Cloudflare Workers。

## 前置要求

1. Cloudflare 账号（[注册地址](https://dash.cloudflare.com/sign-up)）
2. Node.js 18+ 已安装
3. DeepSeek API Key（从 [DeepSeek 平台](https://platform.deepseek.com/) 获取）

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

这将安装 `wrangler`（Cloudflare 的 CLI 工具）和其他依赖。

### 2. 登录 Cloudflare

首次使用需要登录 Cloudflare 账号：

```bash
npx wrangler login
```

这会打开浏览器，引导你完成授权流程。

### 3. 配置环境变量

**重要：** 不要在 `wrangler.toml` 中直接存储 API 密钥！

使用 Wrangler 的 secret 命令安全地设置环境变量：

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

执行后会提示你输入 API 密钥，输入后按回车即可。

### 4. 本地测试（可选）

在部署前，可以在本地测试：

```bash
npm run cf:dev
```

服务会运行在 `http://localhost:8787`

测试 API：

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}'
```

### 5. 部署到 Cloudflare

部署到生产环境：

```bash
npm run cf:deploy
```

部署成功后，你会看到类似输出：

```
Published deepseek-chat-api (1.23 sec)
  https://deepseek-chat-api.your-subdomain.workers.dev
```

记下这个 URL，这就是你的 API 地址！

## 使用 API

### 端点说明

**POST /api/chat**

发送消息给 DeepSeek AI

请求示例：

```bash
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，请介绍一下你自己",
    "conversationHistory": []
  }'
```

响应示例：

```json
{
  "success": true,
  "message": "你好！我是 DeepSeek...",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### 带对话历史的请求

```json
{
  "message": "继续上面的话题",
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

## 管理和监控

### 查看实时日志

```bash
npm run cf:tail
```

### 查看部署信息

```bash
npx wrangler deployments list
```

### 更新环境变量

更新 API 密钥或其他 secret：

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

### 查看所有 secret

```bash
npx wrangler secret list
```

### 删除 secret

```bash
npx wrangler secret delete DEEPSEEK_API_KEY
```

## 自定义域名（可选）

### 1. 在 Cloudflare 添加自定义域名

```bash
npx wrangler domains add api.yourdomain.com
```

### 2. 或在 Cloudflare Dashboard 中配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages
3. 选择你的 Worker
4. 点击 "Triggers" 标签
5. 在 "Custom Domains" 部分添加域名

## 费用说明

Cloudflare Workers 提供免费套餐：

- ✅ 每天 100,000 次请求（免费）
- ✅ 10ms CPU 时间限制
- ✅ 全球边缘网络加速

超出免费额度后按使用量计费。详见 [Cloudflare Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)

## 常见问题

### Q: 部署失败怎么办？

确保：
1. 已登录 Cloudflare：`npx wrangler whoami`
2. 项目名称唯一（可在 `wrangler.toml` 中修改）
3. 已设置 DEEPSEEK_API_KEY

### Q: 如何回滚到之前的版本？

```bash
npx wrangler rollback
```

### Q: 如何删除部署的 Worker？

```bash
npx wrangler delete
```

### Q: API 返回 500 错误？

检查：
1. DEEPSEEK_API_KEY 是否正确设置
2. 查看实时日志：`npm run cf:tail`
3. 确认 DeepSeek API 额度是否充足

## 对比 Vercel

| 特性 | Cloudflare Workers | Vercel |
|-----|-------------------|--------|
| 免费请求数 | 100,000/天 | 100 GB-小时 |
| 冷启动 | 几乎无 | 有 |
| 边缘网络 | ✅ 全球 | ✅ 全球 |
| 配置复杂度 | 简单 | 简单 |
| 自定义域名 | ✅ 免费 | ✅ 免费 |

## 更多资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

## 支持

如有问题，请在 GitHub 仓库提交 Issue。
