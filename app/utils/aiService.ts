import { Todo } from '../types/todo';
import { fallbackAnalysis } from './textAnalysis';

interface AIAnalysisResult {
  success: boolean;
  data?: Partial<Todo>;
  error?: string;
}

// AI 服务类型
type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'custom';

// AI 服务配置
interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  options?: {
    temperature?: number;
    top_k?: number;
    top_p?: number;
    max_tokens?: number;
    stop?: string[];
  };
}

// 构建提示词模板
const buildPrompt = (text: string): string => {
  return `
你是一个任务分析助手，请分析以下任务描述，提取关键信息并返回 JSON 格式的结构化数据。

任务描述: ${text}

请提取以下信息（如果存在）：
1. 任务标题（简洁明了）
2. 任务标签（最多 3 个）
3. 优先级（high/medium/low）
4. 开始日期（YYYY-MM-DD 格式）
5. 截止日期（YYYY-MM-DD 格式）
6. 地点
7. 相关人员
8. 备注信息

请以下面的 JSON 格式返回结果（只返回 JSON，不要有其他文字）：
{
  "text": "任务标题",
  "tags": ["标签1", "标签2"],
  "priority": "优先级",
  "startDate": "开始日期",
  "dueDate": "截止日期",
  "location": "地点",
  "people": ["人员1", "人员2"],
  "notes": "备注信息"
}
`;
};

// 解析 AI 响应
const parseAIResponse = (response: string): Partial<Todo> | null => {
  try {
    // 提取 JSON 部分
    const jsonMatch = response.match(/\{[\s\S]*\}/m);
    if (!jsonMatch) return null;
    
    const jsonStr = jsonMatch[0];
    const data = JSON.parse(jsonStr);
    
    // 验证和清理数据
    const result: Partial<Todo> = {
      text: data.text || '',
      tags: Array.isArray(data.tags) ? data.tags.filter(Boolean).slice(0, 5) : [],
    };
    
    // 添加可选字段
    if (data.priority && ['high', 'medium', 'low'].includes(data.priority)) {
      result.priority = data.priority;
    }
    
    if (data.startDate && /^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
      result.startDate = data.startDate;
    }
    
    if (data.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)) {
      result.dueDate = data.dueDate;
    }
    
    if (data.location) {
      result.location = data.location;
    }
    
    // 构建备注信息
    let notes = data.notes || '';
    
    if (data.people && Array.isArray(data.people) && data.people.length > 0) {
      notes += notes ? '\n\n' : '';
      notes += `相关人员: ${data.people.join(', ')}`;
    }
    
    if (notes) {
      result.notes = notes;
    }
    
    return result;
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    return null;
  }
};

// Ollama API 调用
async function callOllamaAPI(text: string, config: AIConfig): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      prompt: buildPrompt(text),
      stream: false,
      options: config.options
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

// OpenAI API 调用
async function callOpenAIAPI(text: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个任务分析助手，请分析任务描述并返回 JSON 格式的结构化数据。'
        },
        {
          role: 'user',
          content: buildPrompt(text)
        }
      ],
      temperature: config.options?.temperature || 0.3,
      max_tokens: config.options?.max_tokens || 1024
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Anthropic API 调用
async function callAnthropicAPI(text: string, config: AIConfig): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Anthropic API 密钥未配置');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey
    } as HeadersInit,
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'user',
          content: buildPrompt(text)
        }
      ],
      temperature: config.options?.temperature || 0.3,
      max_tokens: config.options?.max_tokens || 1024
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// 获取 AI 配置
function getAIConfig(): AIConfig {
  const provider = process.env.AI_PROVIDER as AIProvider || 'ollama';
  const model = process.env.AI_MODEL || 'gemma3:4b';
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;

  return {
    provider,
    model,
    apiKey,
    baseUrl,
    options: {
      temperature: 0.3,
      top_k: 10,
      top_p: 0.8,
      max_tokens: 1024,
      stop: ["```"]
    }
  };
}

// 分析文本
export const analyzeText = async (text: string): Promise<AIAnalysisResult> => {
  if (!text.trim()) {
    return { success: false, error: '文本不能为空' };
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时
  
  try {
    const config = getAIConfig();
    let response: string;

    // 根据配置调用相应的 AI 服务
    switch (config.provider) {
      case 'ollama':
        response = await callOllamaAPI(text, config);
        break;
      case 'openai':
        response = await callOpenAIAPI(text, config);
        break;
      case 'anthropic':
        response = await callAnthropicAPI(text, config);
        break;
      default:
        throw new Error(`不支持的 AI 服务: ${config.provider}`);
    }

    clearTimeout(timeoutId);
    const result = parseAIResponse(response);

    if (!result) {
      return { success: false, error: 'AI 响应解析失败' };
    }

    return { success: true, data: result };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'AI 服务响应超时' };
    }

    // 使用本地分析作为备选方案
    try {
      const fallbackResult = fallbackAnalysis(text, []);
      return { success: true, data: fallbackResult };
    } catch (fallbackError) {
      return { success: false, error: '文本分析失败' };
    }
  }
}; 