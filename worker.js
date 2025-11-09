/**
 * Cloudflare Workers 入口文件 - GraphQL 版本
 * DeepSeek AI Chat API with GraphQL
 */

import { createYoga, createSchema } from 'graphql-yoga';

// GraphQL Schema 定义
const typeDefs = `
  # 输入类型 - 对话历史条目
  input ConversationInput {
    role: String!
    content: String!
  }

  # Token 使用统计
  type Usage {
    promptTokens: Int
    completionTokens: Int
    totalTokens: Int
  }

  # 聊天响应
  type ChatResponse {
    message: String!
    usage: Usage
  }

  # 清空对话响应
  type ClearResponse {
    success: Boolean!
  }

  # 对话消息
  type ConversationMessage {
    id: ID!
    role: String!
    content: String!
    timestamp: String!
  }

  # 用户信息
  type User {
    id: ID!
    name: String
    email: String
  }

  # Mutations - 修改操作
  type Mutation {
    # 发送消息给 AI
    sendMessage(
      message: String!
      conversationHistory: [ConversationInput!]
    ): ChatResponse!

    # 清空对话历史
    clearConversation: ClearResponse
  }

  # Queries - 查询操作
  type Query {
    # 获取对话历史
    conversationHistory(limit: Int): [ConversationMessage!]

    # 获取用户信息
    user: User

    # 健康检查
    health: String!
  }
`;

// 调用 DeepSeek API 的核心函数
async function callDeepSeekAPI(message, conversationHistory = [], apiKey) {
  // 构建消息历史
  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: message
    }
  ];

  // 调用 DeepSeek API
  const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    })
  });

  // 检查 API 响应状态
  if (!apiResponse.ok) {
    const errorData = await apiResponse.json();
    throw new Error(errorData.error?.message || '调用 DeepSeek API 时发生错误');
  }

  // 解析 API 响应
  const data = await apiResponse.json();
  return {
    message: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  };
}

// GraphQL Resolvers
const resolvers = {
  Query: {
    health: () => 'GraphQL Server is running!',

    // 获取对话历史（示例实现）
    conversationHistory: (parent, args) => {
      // 在实际应用中，这里应该从数据库或存储中获取
      // 目前返回空数组，因为对话历史由前端管理
      return [];
    },

    // 获取用户信息（示例实现）
    user: () => {
      return {
        id: '1',
        name: 'DeepSeek User',
        email: null
      };
    }
  },

  Mutation: {
    // 发送消息
    sendMessage: async (parent, args, context) => {
      const { message, conversationHistory = [] } = args;

      // 验证必填参数
      if (!message || message.trim() === '') {
        throw new Error('消息内容不能为空');
      }

      // 从 context 中获取环境变量
      const { env } = context;

      if (!env.DEEPSEEK_API_KEY) {
        throw new Error('未配置 DEEPSEEK_API_KEY');
      }

      try {
        // 调用 DeepSeek API
        const result = await callDeepSeekAPI(message, conversationHistory, env.DEEPSEEK_API_KEY);
        return result;
      } catch (error) {
        console.error('调用 DeepSeek API 失败:', error);
        throw new Error(`调用 AI 服务失败: ${error.message}`);
      }
    },

    // 清空对话
    clearConversation: () => {
      // 对话历史由前端管理，这里只返回成功标志
      return { success: true };
    }
  }
};

// 主要的 fetch 事件处理器
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 创建 GraphQL Schema
    const schema = createSchema({
      typeDefs,
      resolvers
    });

    // 创建 GraphQL Yoga 实例
    const yoga = createYoga({
      schema,
      // 将环境变量传递给 GraphQL context
      context: { env },
      // 配置 GraphQL 路径
      graphqlEndpoint: '/graphql',
      // 显示详细错误信息（开发模式）
      maskedErrors: false,
      // 配置 CORS
      cors: {
        origin: '*',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'OPTIONS']
      },
      // GraphQL Playground 配置
      graphiql: {
        title: 'DeepSeek Chat GraphQL API',
        defaultQuery: `# 欢迎使用 DeepSeek Chat GraphQL API
#
# 示例查询：

# 1. 健康检查
query {
  health
}

# 2. 发送消息（带对话历史）
mutation {
  sendMessage(
    message: "你好，介绍一下你自己"
    conversationHistory: []
  ) {
    message
    usage {
      promptTokens
      completionTokens
      totalTokens
    }
  }
}

# 3. 清空对话
mutation {
  clearConversation {
    success
  }
}`
      }
    });

    // 只处理 /graphql 路径
    if (url.pathname === '/graphql' || url.pathname === '/') {
      return yoga.fetch(request, env, ctx);
    }

    // 其他路径返回 404
    return new Response(JSON.stringify({
      error: '未找到请求的路径',
      message: '请访问 /graphql 使用 GraphQL API',
      path: url.pathname
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
